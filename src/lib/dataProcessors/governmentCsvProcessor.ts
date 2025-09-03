import { supabase } from '@/lib/supabase';

// =============================================
// INTERFACES
// =============================================

export interface GovernmentCsvRow {
  provider: string;
  female_owned: string; // "Yes" or "No"
  entity: string; // Procuring entity
  proc_reference_no: string; // "Proc Reference No" from MOWT format
  subject_of_procurement: string;
  contract_award_date: string;
  contract_amt_ugx: string;
  status: string;
}

export interface ProcessedAwardee {
  company_name: string;
  business_type: string;
  female_owned: boolean;
  is_active: boolean;
}

export interface ProcessedProcuringEntity {
  entity_name: string;
  is_active: boolean;
}

export interface ProcessedContract {
  reference_number: string;
  title: string;
  awarded_value: number;
  award_date: string;
  completion_status: string;
  category: string;
  data_source: string;
  source_file: string;
  fiscal_year: string;
  status: string;
  current_stage: string;
  publish_status: string;
}

export interface ImportResult {
  success: boolean;
  totalRecords: number;
  successfulImports: number;
  failedImports: number;
  errors: string[];
  importLogId?: string;
}

export interface ValidationError {
  row: number;
  field: string;
  message: string;
  value?: any;
}

// =============================================
// GOVERNMENT DATA PROCESSOR CLASS
// =============================================

export class GovernmentCsvProcessor {
  private sourceFile: string;
  private fiscalYear: string;

  constructor(sourceFile: string, fiscalYear: string) {
    this.sourceFile = sourceFile;
    this.fiscalYear = fiscalYear;
  }

  // =============================================
  // MAIN PROCESSING METHOD
  // =============================================

  async processData(csvData: any[]): Promise<ImportResult> {
    try {
      console.log(`Processing ${csvData.length} records from ${this.sourceFile}`);

      // 1. Create import log
      const importLogId = await this.createImportLog(csvData.length);

      // 2. Validate data (data is already normalized by API)
      const validationResult = this.validateCsvData(csvData);
      if (validationResult.errors.length > 0) {
        await this.updateImportLog(importLogId, 'failed', {
          totalRecords: csvData.length,
          successfulImports: 0,
          failedImports: csvData.length,
          errors: validationResult.errors.map(e => `${e.row}: ${e.message}`)
        });
        return {
          success: false,
          totalRecords: csvData.length,
          successfulImports: 0,
          failedImports: csvData.length,
          errors: validationResult.errors.map(e => `${e.row}: ${e.message}`),
          importLogId
        };
      }

      // 3. Process data
      const processedData = validationResult.validData;
      let successfulImports = 0;
      let failedImports = 0;
      const errors: string[] = [];

      // 4. Process each record
      for (let i = 0; i < processedData.length; i++) {
        try {
          const row = processedData[i];
          await this.processRecord(row, i);
          successfulImports++;
        } catch (error) {
          failedImports++;
          const errorMessage = `Row ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`;
          errors.push(errorMessage);
          console.error(errorMessage, error);
        }
      }

      // 5. Update import log
      await this.updateImportLog(importLogId, 'completed', {
        totalRecords: csvData.length,
        successfulImports,
        failedImports,
        errors
      });

      return {
        success: failedImports === 0,
        totalRecords: csvData.length,
        successfulImports,
        failedImports,
        errors,
        importLogId
      };

    } catch (error) {
      console.error('Error processing CSV:', error);
      return {
        success: false,
        totalRecords: csvData.length,
        successfulImports: 0,
        failedImports: csvData.length,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  // =============================================
  // VALIDATION METHODS
  // =============================================

  private validateCsvData(data: any[]): { validData: any[], errors: ValidationError[] } {
    const validData: any[] = [];
    const errors: ValidationError[] = [];

    console.log('Validating data:', data.length, 'rows');
    console.log('Sample row:', data[0]);
    console.log('Sample row provider:', data[0]?.provider);
    console.log('Sample row entity:', data[0]?.entity);
    console.log('Sample row proc_reference_no:', data[0]?.proc_reference_no);

    data.forEach((row, index) => {
      // Check required fields
      if (!row.provider?.trim()) {
        errors.push({ row: index + 1, field: 'provider', message: 'Provider is required' });
      }
      if (!row.proc_reference_no?.trim()) {
        errors.push({ row: index + 1, field: 'proc_reference_no', message: 'Procurement reference is required' });
      }
      if (!row.entity?.trim()) {
        errors.push({ row: index + 1, field: 'entity', message: 'Entity is required' });
      }
      if (!row.subject_of_procurement?.trim()) {
        errors.push({ row: index + 1, field: 'subject_of_procurement', message: 'Subject of procurement is required' });
      }

      // Check amount - handle comma-separated numbers
      const cleanAmount = row.contract_amt_ugx?.replace(/,/g, '') || '';
      const amount = parseFloat(cleanAmount);
      if (isNaN(amount) || amount <= 0) {
        errors.push({ row: index + 1, field: 'contract_amt_ugx', message: 'Invalid contract amount', value: row.contract_amt_ugx });
      }

      // Check date format - be more lenient for historical data
      if (row.contract_award_date && !this.isValidDate(row.contract_award_date)) {
        errors.push({ row: index + 1, field: 'contract_award_date', message: 'Invalid date format', value: row.contract_award_date });
      }

      // If no errors, add to valid data
      if (errors.filter(e => e.row === index + 1).length === 0) {
        validData.push(row);
      }
    });

    console.log('Validation complete. Valid:', validData.length, 'Errors:', errors.length);
    if (errors.length > 0) {
      console.log('First 5 errors:', errors.slice(0, 5));
    }

    return { validData, errors };
  }

  private isValidDate(dateString: string): boolean {
    if (!dateString || typeof dateString !== 'string') return false;
    
    const trimmedDate = dateString.trim();
    if (!trimmedDate || trimmedDate === '' || trimmedDate.toLowerCase() === 'null' || trimmedDate.toLowerCase() === 'undefined') {
      return false;
    }
    
    // Try different date formats including MOWT format
    const formats = [
      /^\d{4}-\d{2}-\d{2}$/, // YYYY-MM-DD
      /^\d{2}\/\d{2}\/\d{4}$/, // MM/DD/YYYY
      /^\d{2}-\d{2}-\d{4}$/, // MM-DD-YYYY
      /^\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}$/i, // "8 Jul 2024" format
    ];

    return formats.some(format => format.test(trimmedDate));
  }

  // =============================================
  // RECORD PROCESSING
  // =============================================

  private async processRecord(row: any, rowIndex: number): Promise<void> {
    // 1. Process awardee
    const awardee = await this.findOrCreateAwardee({
      company_name: row.provider.trim(),
      business_type: row.female_owned === 'Yes' ? 'Female Owned' : 'Standard',
      female_owned: row.female_owned === 'Yes',
      is_active: true
    });

    // 2. Process procuring entity
    const procuringEntity = await this.findOrCreateProcuringEntity({
      entity_name: row.entity.trim(),
      is_active: true
    });

    // 3. Make reference number unique if it's empty or duplicate
    let uniqueReferenceNumber = row.proc_reference_no.trim();
    if (!uniqueReferenceNumber) {
      uniqueReferenceNumber = `MOWT-${this.fiscalYear}-${rowIndex + 1}`;
    } else {
      // Add suffix to make it unique
      uniqueReferenceNumber = `${uniqueReferenceNumber}-${rowIndex + 1}`;
    }

    // 4. Process contract
    await this.createContract({
      reference_number: uniqueReferenceNumber,
      title: row.subject_of_procurement.trim(),
      awarded_value: parseFloat(row.contract_amt_ugx.replace(/,/g, '')),
      award_date: row.contract_award_date ? this.normalizeDate(row.contract_award_date) : null,
      completion_status: this.normalizeStatus(row.status),
      category: this.classifyContract(row.subject_of_procurement),
      procurement_method: 'open_tender', // Default for historical data
      currency: 'UGX', // Default currency
      margin_of_preference: false, // Default value
      competition_level: 'medium', // Default value
      submission_deadline: row.contract_award_date ? this.normalizeDate(row.contract_award_date) : new Date().toISOString().split('T')[0], // Use award date as deadline
      procuring_entity: row.entity.trim(), // Required field
      requires_registration: true, // Default values for required documents
      requires_trading_license: true,
      requires_tax_clearance: true,
      requires_nssf_clearance: true,
      requires_manufacturer_auth: false,
      awarded_company_id: awardee.id,
      procuring_entity_id: procuringEntity.id,
      data_source: 'government_csv',
      source_file: this.sourceFile,
      fiscal_year: this.fiscalYear,
              status: 'awarded',
        current_stage: 'completed',
        publish_status: 'archived' // Historical data should be archived, not published
    });
  }

  // =============================================
  // ENTITY RESOLUTION
  // =============================================

  private async findOrCreateAwardee(awardeeData: ProcessedAwardee): Promise<any> {
    // First try to find existing awardee by name (fuzzy match)
    const { data: existing } = await supabase
      .from('awardees')
      .select('*')
      .ilike('company_name', `%${awardeeData.company_name}%`)
      .single();

    if (existing) {
      // Update with new information if needed
      await supabase
        .from('awardees')
        .update({ 
          business_type: awardeeData.business_type,
          female_owned: awardeeData.female_owned,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
      
      return existing;
    }

    // Create new awardee
    const { data: newAwardee, error } = await supabase
      .from('awardees')
      .insert([{
        company_name: awardeeData.company_name,
        business_type: awardeeData.business_type,
        female_owned: awardeeData.female_owned,
        is_active: true
      }])
      .select()
      .single();

    if (error) throw new Error(`Failed to create awardee: ${error.message}`);
    return newAwardee;
  }

  private async findOrCreateProcuringEntity(entityData: ProcessedProcuringEntity): Promise<any> {
    // First try to find existing entity by name (fuzzy match)
    const { data: existing } = await supabase
      .from('procuring_entities')
      .select('*')
      .ilike('entity_name', `%${entityData.entity_name}%`)
      .single();

    if (existing) {
      return existing;
    }

    // Create new procuring entity
    const { data: newEntity, error } = await supabase
      .from('procuring_entities')
      .insert([{
        entity_name: entityData.entity_name,
        is_active: true,
        data_source: 'government_csv',
        source_file: this.sourceFile
      }])
      .select()
      .single();

    if (error) throw new Error(`Failed to create procuring entity: ${error.message}`);
    return newEntity;
  }

  private async createContract(contractData: any): Promise<void> {
    const { error } = await supabase
      .from('contracts')
      .insert([contractData]);

    if (error) throw new Error(`Failed to create contract: ${error.message}`);
  }

  // =============================================
  // UTILITY METHODS
  // =============================================

  private classifyContract(title: string): string {
    const title_lower = title.toLowerCase();
    
    if (title_lower.includes('construction') || title_lower.includes('building') || 
        title_lower.includes('road') || title_lower.includes('bridge') || 
        title_lower.includes('infrastructure')) {
      return 'works';
    } else if (title_lower.includes('supply') || title_lower.includes('equipment') || 
               title_lower.includes('materials') || title_lower.includes('goods')) {
      return 'supplies';
    } else if (title_lower.includes('service') || title_lower.includes('consultancy') || 
               title_lower.includes('maintenance') || title_lower.includes('training')) {
      return 'services';
    }
    
    return 'supplies'; // Default category
  }

  private normalizeDate(dateString: string): string {
    // Convert various date formats to YYYY-MM-DD
    
    if (!dateString || typeof dateString !== 'string') {
      return null;
    }
    
    const trimmedDate = dateString.trim();
    if (!trimmedDate || trimmedDate === '' || trimmedDate.toLowerCase() === 'null' || trimmedDate.toLowerCase() === 'undefined') {
      return null;
    }
    
    // Handle MOWT format: "8 Jul 2024"
    const mowtFormat = /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/i;
    const mowtMatch = trimmedDate.match(mowtFormat);
    if (mowtMatch) {
      const day = mowtMatch[1].padStart(2, '0');
      const month = mowtMatch[2].toLowerCase();
      const year = mowtMatch[3];
      
      const monthMap: { [key: string]: string } = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
        'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
        'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
      };
      
      return `${year}-${monthMap[month]}-${day}`;
    }
    
    // Handle slash format: MM/DD/YYYY
    if (trimmedDate.includes('/')) {
      const parts = trimmedDate.split('/');
      if (parts.length === 3) {
        // Assume MM/DD/YYYY format
        return `${parts[2]}-${parts[0].padStart(2, '0')}-${parts[1].padStart(2, '0')}`;
      }
    }
    
    // Handle dash format: YYYY-MM-DD or MM-DD-YYYY
    if (trimmedDate.includes('-')) {
      const parts = trimmedDate.split('-');
      if (parts.length === 3) {
        // If already in YYYY-MM-DD format, return as is
        if (parts[0].length === 4) {
          return trimmedDate;
        }
        // If in MM-DD-YYYY format
        if (parts[0].length === 2) {
          return `${parts[2]}-${parts[0]}-${parts[1]}`;
        }
      }
    }
    
    // If we can't parse it, return null instead of the original string
    return null;
  }

  private normalizeStatus(status: string): string {
    const status_lower = status.toLowerCase();
    
    if (status_lower.includes('complete') || status_lower.includes('finished')) {
      return 'completed';
    } else if (status_lower.includes('ongoing') || status_lower.includes('in progress')) {
      return 'on_track';
    } else if (status_lower.includes('delay') || status_lower.includes('behind')) {
      return 'delayed';
    } else if (status_lower.includes('terminate') || status_lower.includes('cancel')) {
      return 'terminated';
    }
    
    return 'completed'; // Default status for historical data
  }

  // =============================================
  // IMPORT LOGGING
  // =============================================

  private async createImportLog(totalRecords: number): Promise<string> {
    const { data, error } = await supabase
      .from('data_import_logs')
      .insert([{
        import_type: 'government_csv',
        source_file: this.sourceFile,
        fiscal_year: this.fiscalYear,
        total_records: totalRecords,
        import_status: 'processing'
      }])
      .select('id')
      .single();

    if (error) throw new Error(`Failed to create import log: ${error.message}`);
    return data.id;
  }

  private async updateImportLog(importLogId: string, status: string, stats: any): Promise<void> {
    const { error } = await supabase
      .from('data_import_logs')
      .update({
        import_status: status,
        successful_imports: stats.successfulImports,
        failed_imports: stats.failedImports,
        errors: stats.errors,
        completed_at: new Date().toISOString()
      })
      .eq('id', importLogId);

    if (error) throw new Error(`Failed to update import log: ${error.message}`);
  }
}
