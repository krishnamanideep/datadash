"""
Data Analysis and Validation Script for Form20_Localities_Pct
This script analyzes the election data and creates a comprehensive check log.
"""

import json
import sys
from collections import defaultdict

# Assembly mapping (1-30 with names)
ASSEMBLIES = {
    '1': 'Mannadipet',
    '2': 'Thirubhuvanai (SC)',
    '3': 'Ossudu (SC)',
    '4': 'Mangalam',
    '5': 'Villianur',
    '6': 'Ozhukarai',
    '7': 'Kadirkamam',
    '8': 'Indira Nagar',
    '9': 'Thattanchavady',
    '10': 'Kamaraj Nagar',
    '11': 'Lawspet',
    '12': 'Kalapet',
    '13': 'Muthialpet',
    '14': 'Raj Bhavan',
    '15': 'Oupalam',
    '16': 'Orleampeth',
    '17': 'Nellithope',
    '18': 'Mudaliarpet',
    '19': 'Ariankuppam',
    '20': 'Manavely',
    '21': 'Embalam (SC)',
    '22': 'Nettapakkam (SC)',
    '23': 'Bahour',
    '24': 'Nedungadu (SC)',
    '25': 'Thirunallar',
    '26': 'Karaikal North',
    '27': 'Karaikal South',
    '28': 'Neravy T R Pattinam',
    '29': 'Mahe',
    '30': 'Yanam'
}

def load_json_data(filepath):
    """Load and parse JSON data"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def analyze_structure(data, log):
    """Analyze overall data structure"""
    log.append("\n" + "="*80)
    log.append("1. DATA STRUCTURE ANALYSIS")
    log.append("="*80)
    
    all_keys = list(data.keys())
    log.append(f"\nTotal keys in JSON: {len(all_keys)}")
    log.append(f"Keys found: {all_keys}")
    
    # Identify assembly keys vs non-assembly keys
    assembly_keys = [k for k in all_keys if k.startswith('AC_') and '_FINAL' in k]
    non_assembly_keys = [k for k in all_keys if k not in assembly_keys]
    
    log.append(f"\nAssembly data keys: {len(assembly_keys)}")
    log.append(f"Assembly keys: {sorted(assembly_keys)}")
    
    if non_assembly_keys:
        log.append(f"\n⚠️  NON-ASSEMBLY KEYS FOUND (potential issues): {non_assembly_keys}")
    
    # Check which assemblies are present
    present_ac_numbers = []
    for k in assembly_keys:
        try:
            num = k.replace('AC_', '').replace('_FINAL', '')
            present_ac_numbers.append(int(num))
        except ValueError:
            log.append(f"⚠️  Invalid assembly key format: {k}")
    
    present_ac_numbers = sorted(present_ac_numbers)
    expected = set(range(1, 31))
    present = set(present_ac_numbers)
    missing = expected - present
    extra = present - expected
    
    log.append(f"\nAssemblies found in data: {present_ac_numbers}")
    log.append(f"Missing assemblies (should have 1-30): {sorted(missing) if missing else 'None'}")
    log.append(f"Extra assemblies (outside 1-30): {sorted(extra) if extra else 'None'}")
    
    return assembly_keys

def analyze_field_consistency(data, assembly_keys, log):
    """Check field consistency across all entries"""
    log.append("\n" + "="*80)
    log.append("2. FIELD CONSISTENCY ANALYSIS")
    log.append("="*80)
    
    expected_fields = [
        'PS_NO_2021', 'LOCALITY_EXTRACTED', 'Latitude', 'Longitude',
        'NRC_2011', 'NRC_2011_pct', 'PMK_2011', 'PMK_2011_pct',
        'IND_2011', 'IND_2011_pct', 'OTHERS_2011', 'OTHERS_2011_pct', 'POLLED_2011',
        'NRC_2016', 'NRC_2016_pct', 'DMK_2016', 'DMK_2016_pct',
        'AIADMK_2016', 'AIADMK_2016_pct', 'OTHERS_2016', 'OTHERS_2016_pct',
        'NOTA_2016', 'NOTA_2016_pct', 'POLLED_2016',
        'BJP_2021', 'BJP_2021_pct', 'DMK_2021', 'DMK_2021_pct',
        'OTHERS_2021', 'OTHERS_2021_pct', 'NOTA_2021', 'NOTA_2021_pct', 'POLLED_2021',
        'VOTERS_2021', 'VOTERS_2021_pct', 'POLLED_%',
        'NRC_SCORE', 'PMK_SCORE', 'IND_SCORE', 'OTHERS_SCORE',
        'DMK_SCORE', 'AIADMK_SCORE', 'BJP_SCORE',
        'TOP_SCORE_PARTY', 'TOP_SCORE_CATEGORY'
    ]
    
    field_issues = defaultdict(list)
    missing_fields = defaultdict(list)
    
    for ac_key in assembly_keys:
        entries = data[ac_key]
        for idx, entry in enumerate(entries):
            entry_fields = set(entry.keys())
            
            # Check for missing expected fields
            for ef in expected_fields:
                if ef not in entry_fields:
                    missing_fields[ef].append(f"{ac_key}[{idx}]")
            
            # Check for unexpected fields
            unexpected = entry_fields - set(expected_fields)
            if unexpected:
                field_issues[ac_key].append((idx, list(unexpected)))
    
    if missing_fields:
        log.append("\n⚠️  MISSING FIELDS DETECTED:")
        for field, locations in list(missing_fields.items())[:10]:
            log.append(f"   - '{field}': Missing in {len(locations)} entries")
    else:
        log.append("\n✅ All expected fields present in all entries")
    
    if field_issues:
        log.append("\n⚠️  UNEXPECTED FIELDS DETECTED:")
        for ac, issues in list(field_issues.items())[:5]:
            log.append(f"   - {ac}: {issues}")
    else:
        log.append("✅ No unexpected fields found")

def analyze_coordinates(data, assembly_keys, log):
    """Validate geographic coordinates"""
    log.append("\n" + "="*80)
    log.append("3. COORDINATE VALIDATION")
    log.append("="*80)
    
    # Regional bounds for Puducherry, Karaikal, Mahe, Yanam
    bounds = {
        'Puducherry': {'lat': (11.80, 12.10), 'lng': (79.55, 79.90)},
        'Karaikal': {'lat': (10.80, 11.00), 'lng': (79.70, 79.95)},
        'Mahe': {'lat': (11.65, 11.75), 'lng': (75.45, 75.60)},
        'Yanam': {'lat': (16.65, 16.80), 'lng': (82.15, 82.30)}
    }
    
    coordinate_issues = []
    null_coordinates = []
    total_entries = 0
    
    for ac_key in assembly_keys:
        ac_num = ac_key.replace('AC_', '').replace('_FINAL', '')
        entries = data[ac_key]
        
        # Determine expected region based on assembly number
        try:
            ac_int = int(ac_num)
            if 1 <= ac_int <= 23:
                expected_region = 'Puducherry'
            elif 24 <= ac_int <= 28:
                expected_region = 'Karaikal'
            elif ac_int == 29:
                expected_region = 'Mahe'
            elif ac_int == 30:
                expected_region = 'Yanam'
            else:
                expected_region = None
        except:
            expected_region = None
        
        for idx, entry in enumerate(entries):
            total_entries += 1
            lat = entry.get('Latitude')
            lng = entry.get('Longitude')
            
            if lat is None or lng is None:
                null_coordinates.append(f"{ac_key}[{idx}]: {entry.get('LOCALITY_EXTRACTED', 'Unknown')}")
                continue
            
            if not isinstance(lat, (int, float)) or not isinstance(lng, (int, float)):
                coordinate_issues.append(f"{ac_key}[{idx}]: Invalid type - lat={type(lat)}, lng={type(lng)}")
                continue
            
            # Check against expected bounds
            if expected_region:
                b = bounds[expected_region]
                if not (b['lat'][0] <= lat <= b['lat'][1] and b['lng'][0] <= lng <= b['lng'][1]):
                    # Check if it fits in any other region
                    fits_any = False
                    for region, rb in bounds.items():
                        if rb['lat'][0] <= lat <= rb['lat'][1] and rb['lng'][0] <= lng <= rb['lng'][1]:
                            fits_any = True
                            break
                    
                    if not fits_any:
                        coordinate_issues.append(
                            f"{ac_key}[{idx}] ({entry.get('LOCALITY_EXTRACTED', 'Unknown')}): "
                            f"lat={lat}, lng={lng} - Outside all expected regions"
                        )
    
    log.append(f"\nTotal entries checked: {total_entries}")
    log.append(f"Entries with NULL coordinates: {len(null_coordinates)}")
    log.append(f"Entries with invalid/out-of-bounds coordinates: {len(coordinate_issues)}")
    
    if null_coordinates:
        log.append("\n⚠️  ENTRIES WITH NULL COORDINATES:")
        for issue in null_coordinates[:10]:
            log.append(f"   - {issue}")
        if len(null_coordinates) > 10:
            log.append(f"   ... and {len(null_coordinates) - 10} more")
    
    if coordinate_issues:
        log.append("\n⚠️  ENTRIES WITH OUT-OF-BOUNDS COORDINATES:")
        for issue in coordinate_issues[:10]:
            log.append(f"   - {issue}")
        if len(coordinate_issues) > 10:
            log.append(f"   ... and {len(coordinate_issues) - 10} more")
    
    if not null_coordinates and not coordinate_issues:
        log.append("✅ All coordinates are valid and within expected bounds")
    
    return null_coordinates, coordinate_issues

def analyze_percentages(data, assembly_keys, log):
    """Validate percentage calculations"""
    log.append("\n" + "="*80)
    log.append("4. PERCENTAGE VALIDATION")
    log.append("="*80)
    
    percentage_issues = []
    
    for ac_key in assembly_keys:
        entries = data[ac_key]
        
        for idx, entry in enumerate(entries):
            # 2011 percentages
            polled_2011 = entry.get('POLLED_2011', 0)
            if polled_2011 > 0:
                total_pct_2011 = sum([
                    entry.get('NRC_2011_pct', 0),
                    entry.get('PMK_2011_pct', 0),
                    entry.get('IND_2011_pct', 0),
                    entry.get('OTHERS_2011_pct', 0)
                ])
                if abs(total_pct_2011 - 1.0) > 0.05:
                    percentage_issues.append(
                        f"{ac_key}[{idx}] 2011: Total percentage = {total_pct_2011:.4f} (expected ~1.0)"
                    )
            
            # 2016 percentages (including NOTA)
            polled_2016 = entry.get('POLLED_2016', 0)
            if polled_2016 > 0:
                total_pct_2016 = sum([
                    entry.get('NRC_2016_pct', 0),
                    entry.get('DMK_2016_pct', 0),
                    entry.get('AIADMK_2016_pct', 0),
                    entry.get('OTHERS_2016_pct', 0),
                    entry.get('NOTA_2016_pct', 0)
                ])
                if abs(total_pct_2016 - 1.0) > 0.05:
                    percentage_issues.append(
                        f"{ac_key}[{idx}] 2016: Total percentage = {total_pct_2016:.4f} (expected ~1.0)"
                    )
            
            # 2021 percentages
            polled_2021 = entry.get('POLLED_2021', 0)
            if polled_2021 > 0:
                total_pct_2021 = sum([
                    entry.get('BJP_2021_pct', 0),
                    entry.get('DMK_2021_pct', 0),
                    entry.get('OTHERS_2021_pct', 0),
                    entry.get('NOTA_2021_pct', 0)
                ])
                if abs(total_pct_2021 - 1.0) > 0.05:
                    percentage_issues.append(
                        f"{ac_key}[{idx}] 2021: Total percentage = {total_pct_2021:.4f} (expected ~1.0)"
                    )
    
    log.append(f"\nPercentage validation issues: {len(percentage_issues)}")
    
    if percentage_issues:
        log.append("\n⚠️  PERCENTAGE SUM ISSUES:")
        for issue in percentage_issues[:20]:
            log.append(f"   - {issue}")
        if len(percentage_issues) > 20:
            log.append(f"   ... and {len(percentage_issues) - 20} more")
    else:
        log.append("✅ All percentages sum correctly")

def analyze_scores(data, assembly_keys, log):
    """Validate score calculations"""
    log.append("\n" + "="*80)
    log.append("5. SCORE VALIDATION")
    log.append("="*80)
    
    score_issues = []
    category_issues = []
    
    for ac_key in assembly_keys:
        entries = data[ac_key]
        
        for idx, entry in enumerate(entries):
            scores = {
                'NRC': entry.get('NRC_SCORE', 0),
                'PMK': entry.get('PMK_SCORE', 0),
                'IND': entry.get('IND_SCORE', 0),
                'OTHERS': entry.get('OTHERS_SCORE', 0),
                'DMK': entry.get('DMK_SCORE', 0),
                'AIADMK': entry.get('AIADMK_SCORE', 0),
                'BJP': entry.get('BJP_SCORE', 0)
            }
            
            total_score = sum(scores.values())
            if abs(total_score - 1.0) > 0.05:
                score_issues.append(
                    f"{ac_key}[{idx}]: Total score = {total_score:.4f} (expected ~1.0)"
                )
            
            # Validate TOP_SCORE_PARTY
            top_party = entry.get('TOP_SCORE_PARTY', '')
            top_category = entry.get('TOP_SCORE_CATEGORY', '')
            
            if scores:
                max_party = max(scores, key=scores.get)
                max_score = scores[max_party]
                
                # Check if TOP_SCORE_PARTY matches
                if max_party not in top_party:
                    score_issues.append(
                        f"{ac_key}[{idx}]: TOP_SCORE_PARTY '{top_party}' doesn't match calculated max '{max_party}'"
                    )
                
                # Validate category (A > 50%, B > 30%, C <= 30%)
                expected_cat = 'C'
                if max_score > 0.50:
                    expected_cat = 'A'
                elif max_score > 0.30:
                    expected_cat = 'B'
                
                if top_category != expected_cat:
                    category_issues.append(
                        f"{ac_key}[{idx}]: Category '{top_category}' doesn't match expected '{expected_cat}' for score {max_score:.2%}"
                    )
    
    log.append(f"\nScore sum issues: {len(score_issues)}")
    log.append(f"Category issues: {len(category_issues)}")
    
    if score_issues:
        log.append("\n⚠️  SCORE ISSUES:")
        for issue in score_issues[:10]:
            log.append(f"   - {issue}")
        if len(score_issues) > 10:
            log.append(f"   ... and {len(score_issues) - 10} more")
    
    if category_issues:
        log.append("\n⚠️  CATEGORY ISSUES:")
        for issue in category_issues[:10]:
            log.append(f"   - {issue}")
        if len(category_issues) > 10:
            log.append(f"   ... and {len(category_issues) - 10} more")
    
    if not score_issues and not category_issues:
        log.append("✅ All scores and categories are valid")

def count_entries_per_assembly(data, assembly_keys, log):
    """Count entries per assembly"""
    log.append("\n" + "="*80)
    log.append("6. ENTRY COUNT PER ASSEMBLY")
    log.append("="*80)
    
    counts = {}
    total = 0
    for ac_key in assembly_keys:
        ac_num = ac_key.replace('AC_', '').replace('_FINAL', '')
        count = len(data[ac_key])
        ac_name = ASSEMBLIES.get(ac_num, 'Unknown')
        counts[ac_key] = count
        total += count
        log.append(f"   AC {ac_num:>2} ({ac_name:25}): {count} entries")
    
    log.append(f"\n   TOTAL: {total} entries")
    
    return counts

def generate_summary(log, data, assembly_keys):
    """Generate a summary of findings"""
    log.append("\n" + "="*80)
    log.append("SUMMARY")  
    log.append("="*80)
    
    total_entries = sum(len(data[k]) for k in assembly_keys)
    log.append(f"\n✅ Total assemblies with data: {len(assembly_keys)}")
    log.append(f"✅ Total polling station entries: {total_entries}")
    log.append(f"✅ Years covered: 2011, 2016, 2021")
    log.append(f"✅ Parties tracked: NRC, PMK, DMK, AIADMK, BJP, IND, OTHERS")

def main():
    log = []
    log.append("="*80)
    log.append("DATA ANALYSIS AND VALIDATION REPORT")
    log.append("Form20_Localities_Pct.json")
    log.append("="*80)
    
    try:
        data = load_json_data('Form20_Localities_Pct.json')
        
        assembly_keys = analyze_structure(data, log)
        if assembly_keys:
            analyze_field_consistency(data, assembly_keys, log)
            analyze_coordinates(data, assembly_keys, log)
            analyze_percentages(data, assembly_keys, log)
            analyze_scores(data, assembly_keys, log)
            count_entries_per_assembly(data, assembly_keys, log)
            generate_summary(log, data, assembly_keys)
        
    except Exception as e:
        log.append(f"\n❌ ERROR: {str(e)}")
        import traceback
        log.append(traceback.format_exc())
    
    # Print log
    print('\n'.join(log))
    
    # Save log
    with open('data_check_log.txt', 'w', encoding='utf-8') as f:
        f.write('\n'.join(log))
    
    print("\n\nLog saved to: data_check_log.txt")

if __name__ == '__main__':
    main()
