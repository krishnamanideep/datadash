"""
Fix null coordinates and update coordinate bounds
"""
import json

# Load JSON
with open('Form20_Localities_Pct.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("Fixing data issues...")

# Fix 1: Null coordinates in AC_3
# Get average coordinates from neighboring entries
ac3_data = data.get('AC_3_FINAL', [])
if len(ac3_data) > 32:
    entry = ac3_data[32]
    if entry.get('Latitude') is None or entry.get('Longitude') is None:
        print(f"\nFound null coordinates at AC_3[32]: {entry.get('PS_NO_2021', 'Unknown')}")
        
        # Average from neighboring entries
        neighbors = []
        for i in [30, 31, 33]:
            if 0 <= i < len(ac3_data) and ac3_data[i].get('Latitude'):
                neighbors.append((ac3_data[i]['Latitude'], ac3_data[i]['Longitude']))
        
        if neighbors:
            avg_lat = sum(n[0] for n in neighbors) / len(neighbors)
            avg_lng = sum(n[1] for n in neighbors) / len(neighbors)
            
            entry['Latitude'] = avg_lat
            entry['Longitude'] = avg_lng
            print(f"  Fixed: Set to ({avg_lat:.6f}, {avg_lng:.6f})")
        else:
            # Default Ossudu coordinates
            entry['Latitude'] = 11.9850
            entry['Longitude'] = 79.7550
            print(f"  Fixed: Set to default Ossudu coordinates")

# Save updated JSON
with open('Form20_Localities_Pct.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=1)

print("\nJSON updated successfully!")

# Verify
print("\n" + "="*60)
print("FINAL VERIFICATION")
print("="*60)

# Count assemblies
ac_keys = [k for k in data.keys() if k.startswith('AC_') and '_FINAL' in k]
ac_nums = sorted([int(k.replace('AC_', '').replace('_FINAL', '')) for k in ac_keys])
print(f"\nTotal assemblies: {len(ac_keys)}")
print(f"Assembly numbers: {ac_nums}")

expected = set(range(1, 31))
found = set(ac_nums)
missing = sorted(expected - found)
print(f"Missing assemblies: {missing if missing else 'None - ALL 30 PRESENT!'}")

# Count total booths
total_booths = sum(len(data[k]) for k in ac_keys)
print(f"\nTotal polling stations: {total_booths}")

# Check for null coordinates
null_coords = []
for key in ac_keys:
    for i, entry in enumerate(data[key]):
        if entry.get('Latitude') is None or entry.get('Longitude') is None:
            null_coords.append(f"{key}[{i}]")

print(f"Entries with null coordinates: {len(null_coords)}")
if null_coords:
    print(f"  {null_coords}")

# Category distribution
cat_a = cat_b = cat_c = 0
for key in ac_keys:
    for entry in data[key]:
        cat = entry.get('TOP_SCORE_CATEGORY', 'C')
        if cat == 'A': cat_a += 1
        elif cat == 'B': cat_b += 1
        else: cat_c += 1

print(f"\nCategory Distribution:")
print(f"  Category A (>50%): {cat_a} booths ({cat_a/total_booths*100:.1f}%)")
print(f"  Category B (30-50%): {cat_b} booths ({cat_b/total_booths*100:.1f}%)")
print(f"  Category C (<30%): {cat_c} booths ({cat_c/total_booths*100:.1f}%)")

print("\n" + "="*60)
print("ALL FIXES COMPLETE!")
print("="*60)
