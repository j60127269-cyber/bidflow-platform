# n8n AI Processing Workflow Setup Guide

## 🚀 **Complete Workflow Overview**

Your n8n workflow will automatically process contracts with AI when they're imported. Here's how to set it up:

## 📋 **Prerequisites**

1. **Groq API Key**: Get your free API key from [Groq Console](https://console.groq.com/)
2. **n8n Instance**: Either n8n Cloud or self-hosted
3. **Webhook URL**: Your n8n webhook URL: `https://bidcloudd.app.n8n.cloud/webhook/ai-processing-webhook`

## 🔧 **Setup Steps**

### **Step 1: Import the Complete Workflow**

1. Copy the workflow from `docs/n8n-workflow-complete.json`
2. Import it into your n8n instance
3. Replace the placeholder values with your actual credentials

### **Step 2: Configure Credentials**

#### **Header Auth for BidCloud.org**
- **Name**: `Header Auth account`
- **Header Name**: `Authorization`
- **Header Value**: `Bearer YOUR_BIDCLOUD_API_KEY` (if you have one, or leave empty for now)

#### **Groq API Key**
- **Name**: `Groq API Key`
- **Header Name**: `Authorization`
- **Header Value**: `Bearer YOUR_GROQ_API_KEY`

### **Step 3: Update Webhook URL**

In your contract import system, you'll need to trigger this webhook when contracts are imported. Add this to your bulk import API:

```typescript
// After successful contract import
const webhookUrl = 'https://bidcloudd.app.n8n.cloud/webhook/ai-processing-webhook';
const contractIds = insertedContracts.map(c => c.id);

await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_WEBHOOK_AUTH_TOKEN'
  },
  body: JSON.stringify({
    contractIds: contractIds
  })
});
```

## 🔄 **Workflow Flow**

1. **Webhook Trigger**: Receives contract IDs from import process
2. **Batch Processing**: Processes contracts in batches to avoid overwhelming the system
3. **Get Contract Data**: Fetches contract details from your API
4. **Check Processing Status**: Skips contracts already processed
5. **AI Processing**: Uses Groq API to generate summaries and categories
6. **Parse Response**: Extracts AI results from Groq response
7. **Update Contract**: Saves AI results back to your database

## 🎯 **Expected Input/Output**

### **Webhook Input**
```json
{
  "contractIds": [
    "eb8f27fb-3b85-4afb-ab77-2c4ac005ce59",
    "another-contract-id"
  ]
}
```

### **AI Processing Output**
```json
{
  "contractId": "eb8f27fb-3b85-4afb-ab77-2c4ac005ce59",
  "aiSummaryShort": "This contract involves marketing and distribution services for offloading fees in Mpigi district...",
  "aiCategory": "services",
  "processingStatus": "completed"
}
```

## ⚙️ **Configuration Options**

### **Batch Size**
- Default: 5 contracts per batch
- Adjust in "Process Contracts in Batches" node

### **AI Model**
- Default: `llama-3.1-70b-versatile`
- Alternative: `mixtral-8x7b-32768` (faster, cheaper)

### **Processing Categories**
- `construction`: Building, infrastructure, engineering
- `supplies`: Equipment, materials, goods
- `services`: Consulting, maintenance, support
- `it`: Software, hardware, technology
- `other`: Everything else

## 🚨 **Error Handling**

The workflow includes comprehensive error handling:

1. **Already Processed**: Skips contracts with existing AI data
2. **API Failures**: Logs errors and continues with next contract
3. **Invalid Data**: Validates contract data before processing
4. **Rate Limiting**: Built-in delays between API calls

## 📊 **Monitoring**

### **Success Metrics**
- Contracts processed successfully
- AI accuracy (manual review recommended)
- Processing time per contract

### **Error Tracking**
- Failed API calls
- Invalid contract data
- Groq API rate limits

## 🔒 **Security Considerations**

1. **API Keys**: Store securely in n8n credentials
2. **Webhook Authentication**: Use header authentication
3. **Data Privacy**: AI processing happens via Groq (review their privacy policy)
4. **Rate Limiting**: Implement delays to avoid overwhelming APIs

## 🧪 **Testing**

### **Test Individual Steps**
1. Test webhook with sample data
2. Verify contract data retrieval
3. Test Groq API integration
4. Confirm database updates

### **Sample Test Data**
```json
{
  "contractIds": ["eb8f27fb-3b85-4afb-ab77-2c4ac005ce59"]
}
```

## 🚀 **Deployment**

1. **Activate Workflow**: Enable the workflow in n8n
2. **Update Import System**: Add webhook trigger to contract import
3. **Monitor**: Watch for successful processing
4. **Scale**: Adjust batch sizes based on performance

## 📈 **Performance Optimization**

- **Batch Size**: Start with 5, adjust based on API limits
- **Concurrent Processing**: n8n handles this automatically
- **Caching**: Consider caching frequently accessed contract data
- **Monitoring**: Set up alerts for failed processing

## 🆘 **Troubleshooting**

### **Common Issues**
1. **Webhook Not Triggering**: Check URL and authentication
2. **API Errors**: Verify API keys and rate limits
3. **Data Format Issues**: Check contract data structure
4. **Processing Failures**: Review Groq API responses

### **Debug Steps**
1. Check n8n execution logs
2. Verify API endpoint responses
3. Test individual workflow steps
4. Review error messages in detail

---

## 📞 **Support**

If you encounter issues:
1. Check the n8n execution logs
2. Verify all credentials are correct
3. Test API endpoints manually
4. Review the workflow step by step

The workflow is designed to be robust and handle errors gracefully while providing detailed logging for troubleshooting.
