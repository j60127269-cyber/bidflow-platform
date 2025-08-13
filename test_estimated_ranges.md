# Estimated Price Ranges - Test Examples

## How the Estimated Ranges Work

The system now shows estimated price ranges instead of exact values, similar to the image showing ranges like "$100K-$500K" and "$1M-$5M".

### Range Calculation Logic:

1. **1B+ contracts**: 30% range (e.g., 2B → "Estimated 1B-3B UGX")
2. **1M+ contracts**: 40% range (e.g., 3M → "Estimated 2M-4M UGX") 
3. **100K+ contracts**: 50% range (e.g., 200K → "Estimated 100K-300K UGX")
4. **10K+ contracts**: 60% range (e.g., 50K → "Estimated 20K-80K UGX")
5. **Under 10K**: 70% range (e.g., 5K → "Estimated 2K-8K UGX")

### Example Conversions:

| Original Value | Estimated Range | Display |
|----------------|-----------------|---------|
| 50,000,000     | 30M-70M         | "Estimated 30M-70M UGX" |
| 150,000,000    | 75M-225M        | "Estimated 75M-225M UGX" |
| 500,000,000    | 300M-700M       | "Estimated 300M-700M UGX" |
| 1,000,000,000  | 700M-1.3B       | "Estimated 700M-1.3B UGX" |
| 2,500,000,000  | 1.7B-3.3B       | "Estimated 1.7B-3.3B UGX" |

### Benefits:

1. **More Realistic**: Reflects the uncertainty in contract pricing
2. **User-Friendly**: Easier to understand than exact amounts
3. **Professional**: Matches industry standards for tender displays
4. **Consistent**: Same format across all pages (Dashboard, Details, Recommended)
5. **Clear Labeling**: "Estimated" prefix makes it clear these are not exact values

### Visual Display:

- **Green badges** with rounded corners
- **"Estimated" label** clearly indicates these are approximate values
- **Consistent styling** across all contract cards
- **Right-aligned** in the contract details grid
- **Professional appearance** matching the design in the image
