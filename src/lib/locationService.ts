import { supabase } from './supabase';

export interface Location {
  name: string;
  region: string;
  sort_order: number;
}

export class LocationService {
  /**
   * Get all active locations from database
   */
  async getActiveLocations(): Promise<Location[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_active_locations');

      if (error) {
        console.error('Error fetching locations:', error);
        // Fallback to hardcoded locations if database fails
        return this.getFallbackLocations();
      }

      return data || [];
    } catch (error) {
      console.error('Error in getActiveLocations:', error);
      return this.getFallbackLocations();
    }
  }

  /**
   * Get locations as simple string array
   */
  async getLocationNames(): Promise<string[]> {
    const locations = await this.getActiveLocations();
    return locations.map(loc => loc.name);
  }

  /**
   * Fallback locations if database is not available
   */
  private getFallbackLocations(): Location[] {
    return [
      { name: 'Kampala', region: 'Central', sort_order: 1 },
      { name: 'Jinja', region: 'Eastern', sort_order: 2 },
      { name: 'Gulu', region: 'Northern', sort_order: 3 },
      { name: 'Mbarara', region: 'Western', sort_order: 4 },
      { name: 'Entebbe', region: 'Central', sort_order: 5 },
      { name: 'Arua', region: 'Northern', sort_order: 6 },
      { name: 'Lira', region: 'Northern', sort_order: 7 },
      { name: 'Mbale', region: 'Eastern', sort_order: 8 },
      { name: 'Soroti', region: 'Eastern', sort_order: 9 },
      { name: 'Tororo', region: 'Eastern', sort_order: 10 },
      { name: 'Kasese', region: 'Western', sort_order: 11 },
      { name: 'Kabale', region: 'Western', sort_order: 12 },
      { name: 'Fort Portal', region: 'Western', sort_order: 13 },
      { name: 'Hoima', region: 'Western', sort_order: 14 },
      { name: 'Masaka', region: 'Central', sort_order: 15 },
      { name: 'Mukono', region: 'Central', sort_order: 16 },
      { name: 'Wakiso', region: 'Central', sort_order: 17 },
      { name: 'Multiple Locations', region: 'All', sort_order: 98 },
      { name: 'Any Location', region: 'All', sort_order: 99 }
    ];
  }
}

export const locationService = new LocationService();
