"""
Update booth categories to include Category D (below 20%)
Categories:
  A: >50%
  B: 30-50%
  C: 20-30%
  D: <20%
"""
import json

# Load JSON
with open('Form20_Localities_Pct.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("Updating booth categories...")

# Get all assembly keys
ac_keys = [k for k in data.keys() if k.startswith('AC_') and '_FINAL' in k]

# Count updates
updated = 0
cat_counts = {'A': 0, 'B': 0, 'C': 0, 'D': 0}

for key in ac_keys:
    for entry in data[key]:
        # Get all score fields
        scores = {}
        for field, value in entry.items():
            if field.endswith('_SCORE') and isinstance(value, (int, float)):
                scores[field] = value
        
        if scores:
            top_party = max(scores, key=scores.get)
            top_value = scores[top_party]
            
            # Recategorize
            if top_value > 0.50:
                new_cat = 'A'
            elif top_value > 0.30:
                new_cat = 'B'
            elif top_value > 0.20:
                new_cat = 'C'
            else:
                new_cat = 'D'
            
            old_cat = entry.get('TOP_SCORE_CATEGORY', '')
            if old_cat != new_cat:
                entry['TOP_SCORE_CATEGORY'] = new_cat
                updated += 1
            
            cat_counts[new_cat] += 1

# Save updated JSON
with open('Form20_Localities_Pct.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=1)

print(f"\nUpdated {updated} entries")
print("\n" + "="*60)
print("NEW CATEGORY DISTRIBUTION")
print("="*60)

total = sum(cat_counts.values())
print(f"\nCategory A (>50%):   {cat_counts['A']:3d} booths ({cat_counts['A']/total*100:5.1f}%)")
print(f"Category B (30-50%): {cat_counts['B']:3d} booths ({cat_counts['B']/total*100:5.1f}%)")
print(f"Category C (20-30%): {cat_counts['C']:3d} booths ({cat_counts['C']/total*100:5.1f}%)")
print(f"Category D (<20%):   {cat_counts['D']:3d} booths ({cat_counts['D']/total*100:5.1f}%)")
print(f"\nTotal: {total} booths")
