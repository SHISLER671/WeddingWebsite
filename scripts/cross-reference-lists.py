#!/usr/bin/env python3
"""
Cross-reference all CSV guest lists to identify:
- Missing people (MASTERGUESTLIST should have everyone)
- Misspellings
- Missing last names
- Missing titles (Uncle, Auntie, etc.)
- Duplicates within same list
- Other inconsistencies
"""

import csv
import re
from collections import defaultdict
from difflib import SequenceMatcher
from pathlib import Path

# Base directory
BASE_DIR = Path(__file__).parent.parent

# File paths
FILES = {
    'MASTER': BASE_DIR / 'MASTERGUESTLIST.csv',
    'FINAL': BASE_DIR / 'FINALlist.csv',
    'OFFISLAND': BASE_DIR / '0FFISLANDb.csv',
    'BLIST': BASE_DIR / 'BLIST.csv',
    'GLIST': BASE_DIR / 'GLIST.csv',
    'GROOMFAM': BASE_DIR / 'GROOMFAM.csv',
    'ATTENDEES_BRIDE': BASE_DIR / 'ATTENDEESBride.csv',
    'ATTENDEES_GROOM': BASE_DIR / 'ATTENDEESGroom.csv',
}

def normalize_name(name):
    """Normalize name for comparison (lowercase, remove extra spaces)"""
    if not name:
        return ""
    # Remove common prefixes/suffixes for comparison
    name = name.lower().strip()
    # Remove "and family", "and guest", etc.
    name = re.sub(r'\s+and\s+(family|guest|guests).*', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*\+\d+.*', '', name)  # Remove +1, +2, etc.
    name = re.sub(r'\s*\(.*?\)', '', name)  # Remove parenthetical notes
    name = re.sub(r'\s+', ' ', name)  # Normalize whitespace
    return name.strip()

def extract_names(full_name):
    """Extract individual names from a full name string"""
    if not full_name:
        return []
    
    # Split by common separators
    names = re.split(r'\s+&\s+|\s+and\s+', full_name, flags=re.IGNORECASE)
    result = []
    for name in names:
        # Remove titles, notes, etc.
        name = re.sub(r'^(uncle|auntie|aunt|fr\.|nino)\s+', '', name, flags=re.IGNORECASE)
        name = re.sub(r'\s+and\s+(family|guest|guests).*', '', name, flags=re.IGNORECASE)
        name = re.sub(r'\s*\+\d+.*', '', name)
        name = re.sub(r'\s*\(.*?\)', '', name)
        name = name.strip()
        if name:
            result.append(name)
    return result

def has_last_name(name):
    """Check if name appears to have a last name (has at least 2 words)"""
    if not name:
        return False
    # Remove titles
    name = re.sub(r'^(uncle|auntie|aunt|fr\.|nino)\s+', '', name, flags=re.IGNORECASE)
    # Remove notes in parentheses
    name = re.sub(r'\s*\(.*?\)', '', name)
    words = name.split()
    return len(words) >= 2

def similarity(a, b):
    """Calculate similarity ratio between two strings"""
    return SequenceMatcher(None, a.lower(), b.lower()).ratio()

def read_csv_file(filepath):
    """Read CSV file and return list of entries"""
    if not filepath.exists():
        return []
    
    entries = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            full_name = row.get('Full Name', '').strip()
            if full_name:
                entries.append({
                    'full_name': full_name,
                    'normalized': normalize_name(full_name),
                    'row': row
                })
    return entries

def find_similar_names(name, all_names, threshold=0.85):
    """Find similar names that might be misspellings"""
    similar = []
    for other_name, source in all_names:
        if name != other_name and similarity(name, other_name) >= threshold:
            similar.append((other_name, source))
    return similar

def main():
    print("=" * 80)
    print("CROSS-REFERENCE ANALYSIS OF GUEST LISTS")
    print("=" * 80)
    print()
    
    # Read all files
    all_lists = {}
    for list_name, filepath in FILES.items():
        all_lists[list_name] = read_csv_file(filepath)
        print(f"Loaded {list_name}: {len(all_lists[list_name])} entries")
    
    print()
    print("=" * 80)
    print("ISSUES FOUND")
    print("=" * 80)
    print()
    
    # 1. Check for duplicates within each list
    print("1. DUPLICATES WITHIN SAME LIST")
    print("-" * 80)
    duplicates_found = False
    for list_name, entries in all_lists.items():
        seen = defaultdict(list)
        for entry in entries:
            normalized = entry['normalized']
            if normalized:
                seen[normalized].append(entry['full_name'])
        
        for normalized, names in seen.items():
            if len(names) > 1:
                duplicates_found = True
                print(f"  {list_name}: Found duplicate '{names[0]}' ({len(names)} times)")
                for name in names[1:]:
                    print(f"    - Also appears as: '{name}'")
    
    if not duplicates_found:
        print("  ✓ No duplicates found within individual lists")
    print()
    
    # 2. Check for missing last names
    print("2. MISSING LAST NAMES")
    print("-" * 80)
    missing_last_names = False
    for list_name, entries in all_lists.items():
        for entry in entries:
            full_name = entry['full_name']
            # Check each name in the entry
            names = extract_names(full_name)
            for name in names:
                if not has_last_name(name) and name.lower() not in ['guest', 'family']:
                    missing_last_names = True
                    print(f"  {list_name}: '{full_name}' - '{name}' appears to be missing last name")
    
    if not missing_last_names:
        print("  ✓ All names appear to have last names")
    print()
    
    # 3. Check for missing titles (Uncle/Auntie) - compare with MASTER
    print("3. MISSING TITLES (Uncle/Auntie)")
    print("-" * 80)
    master_entries = {e['normalized']: e['full_name'] for e in all_lists['MASTER']}
    missing_titles = False
    
    for list_name, entries in all_lists.items():
        if list_name == 'MASTER':
            continue
        for entry in entries:
            normalized = entry['normalized']
            if normalized in master_entries:
                master_name = master_entries[normalized]
                entry_name = entry['full_name']
                # Check if master has title but this entry doesn't
                master_has_title = bool(re.search(r'\b(uncle|auntie|aunt|fr\.|nino)\b', master_name, re.IGNORECASE))
                entry_has_title = bool(re.search(r'\b(uncle|auntie|aunt|fr\.|nino)\b', entry_name, re.IGNORECASE))
                
                if master_has_title and not entry_has_title:
                    missing_titles = True
                    print(f"  {list_name}: '{entry_name}' - Missing title (MASTER has: '{master_name}')")
    
    if not missing_titles:
        print("  ✓ No missing titles found")
    print()
    
    # 4. Check for people in other lists but not in MASTER
    print("4. PEOPLE IN OTHER LISTS BUT NOT IN MASTERGUESTLIST")
    print("-" * 80)
    master_normalized = {e['normalized'] for e in all_lists['MASTER']}
    missing_from_master = False
    
    for list_name, entries in all_lists.items():
        if list_name == 'MASTER':
            continue
        for entry in entries:
            normalized = entry['normalized']
            if normalized and normalized not in master_normalized:
                # Check for similar names in master
                similar = find_similar_names(entry['full_name'], 
                                            [(e['full_name'], 'MASTER') for e in all_lists['MASTER']])
                if similar:
                    missing_from_master = True
                    print(f"  {list_name}: '{entry['full_name']}' not in MASTER (similar: {similar[0][0]})")
                else:
                    missing_from_master = True
                    print(f"  {list_name}: '{entry['full_name']}' not in MASTER")
    
    if not missing_from_master:
        print("  ✓ All people from other lists are in MASTERGUESTLIST")
    print()
    
    # 5. Check for potential misspellings (similar names across lists)
    print("5. POTENTIAL MISSPELLINGS (Similar names across lists)")
    print("-" * 80)
    all_names_with_source = []
    for list_name, entries in all_lists.items():
        for entry in entries:
            all_names_with_source.append((entry['full_name'], list_name))
    
    potential_misspellings = set()
    for i, (name1, source1) in enumerate(all_names_with_source):
        for name2, source2 in all_names_with_source[i+1:]:
            if source1 != source2 and name1 != name2:
                norm1 = normalize_name(name1)
                norm2 = normalize_name(name2)
                if norm1 and norm2 and similarity(norm1, norm2) >= 0.85 and similarity(norm1, norm2) < 1.0:
                    pair = tuple(sorted([(name1, source1), (name2, source2)]))
                    if pair not in potential_misspellings:
                        potential_misspellings.add(pair)
                        print(f"  Potential misspelling:")
                        print(f"    '{name1}' ({source1})")
                        print(f"    '{name2}' ({source2})")
                        print(f"    Similarity: {similarity(norm1, norm2):.2%}")
    
    if not potential_misspellings:
        print("  ✓ No obvious misspellings found")
    print()
    
    # 6. Check BLIST/GLIST should be MASTER split minus OFFISLAND
    print("6. BLIST/GLIST vs MASTER minus OFFISLAND")
    print("-" * 80)
    offisland_normalized = {e['normalized'] for e in all_lists['OFFISLAND']}
    master_minus_offisland = {e['normalized'] for e in all_lists['MASTER'] 
                              if e['normalized'] not in offisland_normalized}
    
    blist_normalized = {e['normalized'] for e in all_lists['BLIST']}
    glist_normalized = {e['normalized'] for e in all_lists['GLIST']}
    combined_blist_glist = blist_normalized | glist_normalized
    
    # Check for entries in BLIST/GLIST that shouldn't be there (are in OFFISLAND)
    in_blist_but_offisland = []
    in_glist_but_offisland = []
    for entry in all_lists['BLIST']:
        if entry['normalized'] in offisland_normalized:
            in_blist_but_offisland.append(entry['full_name'])
    for entry in all_lists['GLIST']:
        if entry['normalized'] in offisland_normalized:
            in_glist_but_offisland.append(entry['full_name'])
    
    if in_blist_but_offisland:
        print(f"  BLIST contains {len(in_blist_but_offisland)} entries that are in OFFISLAND:")
        for name in in_blist_but_offisland:
            print(f"    - {name}")
    
    if in_glist_but_offisland:
        print(f"  GLIST contains {len(in_glist_but_offisland)} entries that are in OFFISLAND:")
        for name in in_glist_but_offisland:
            print(f"    - {name}")
    
    # Check for entries in MASTER minus OFFISLAND that are missing from BLIST/GLIST
    missing_from_blist_glist = master_minus_offisland - combined_blist_glist
    if missing_from_blist_glist:
        print(f"  {len(missing_from_blist_glist)} entries in MASTER (minus OFFISLAND) not in BLIST or GLIST:")
        for norm in sorted(missing_from_blist_glist):
            # Find original name
            for entry in all_lists['MASTER']:
                if entry['normalized'] == norm:
                    print(f"    - {entry['full_name']}")
                    break
    
    # Check for entries in BLIST/GLIST that aren't in MASTER
    in_blist_glist_not_master = combined_blist_glist - {e['normalized'] for e in all_lists['MASTER']}
    if in_blist_glist_not_master:
        print(f"  {len(in_blist_glist_not_master)} entries in BLIST/GLIST not in MASTER:")
        for norm in sorted(in_blist_glist_not_master):
            for entry in all_lists['BLIST'] + all_lists['GLIST']:
                if entry['normalized'] == norm:
                    print(f"    - {entry['full_name']} (from BLIST or GLIST)")
                    break
    
    if not in_blist_but_offisland and not in_glist_but_offisland and not missing_from_blist_glist and not in_blist_glist_not_master:
        print("  ✓ BLIST and GLIST correctly represent MASTER minus OFFISLAND")
    print()
    
    # 7. Check ATTENDEES lists should be BLIST/GLIST minus OFFISLAND
    print("7. ATTENDEES lists vs BLIST/GLIST minus OFFISLAND")
    print("-" * 80)
    attendees_bride_normalized = {e['normalized'] for e in all_lists['ATTENDEES_BRIDE']}
    attendees_groom_normalized = {e['normalized'] for e in all_lists['ATTENDEES_GROOM']}
    
    blist_minus_offisland = blist_normalized - offisland_normalized
    glist_minus_offisland = glist_normalized - offisland_normalized
    
    # Check ATTENDEES_BRIDE vs BLIST minus OFFISLAND
    missing_from_attendees_bride = blist_minus_offisland - attendees_bride_normalized
    extra_in_attendees_bride = attendees_bride_normalized - blist_minus_offisland
    
    if missing_from_attendees_bride:
        print(f"  ATTENDEES_BRIDE missing {len(missing_from_attendees_bride)} entries from BLIST (minus OFFISLAND):")
        for norm in sorted(missing_from_attendees_bride):
            for entry in all_lists['BLIST']:
                if entry['normalized'] == norm:
                    print(f"    - {entry['full_name']}")
                    break
    
    if extra_in_attendees_bride:
        print(f"  ATTENDEES_BRIDE has {len(extra_in_attendees_bride)} entries not in BLIST (minus OFFISLAND):")
        for norm in sorted(extra_in_attendees_bride):
            for entry in all_lists['ATTENDEES_BRIDE']:
                if entry['normalized'] == norm:
                    print(f"    - {entry['full_name']}")
                    break
    
    # Check ATTENDEES_GROOM vs GLIST minus OFFISLAND
    missing_from_attendees_groom = glist_minus_offisland - attendees_groom_normalized
    extra_in_attendees_groom = attendees_groom_normalized - glist_minus_offisland
    
    if missing_from_attendees_groom:
        print(f"  ATTENDEES_GROOM missing {len(missing_from_attendees_groom)} entries from GLIST (minus OFFISLAND):")
        for norm in sorted(missing_from_attendees_groom):
            for entry in all_lists['GLIST']:
                if entry['normalized'] == norm:
                    print(f"    - {entry['full_name']}")
                    break
    
    if extra_in_attendees_groom:
        print(f"  ATTENDEES_GROOM has {len(extra_in_attendees_groom)} entries not in GLIST (minus OFFISLAND):")
        for norm in sorted(extra_in_attendees_groom):
            for entry in all_lists['ATTENDEES_GROOM']:
                if entry['normalized'] == norm:
                    print(f"    - {entry['full_name']}")
                    break
    
    if not missing_from_attendees_bride and not extra_in_attendees_bride and not missing_from_attendees_groom and not extra_in_attendees_groom:
        print("  ✓ ATTENDEES lists correctly represent BLIST/GLIST minus OFFISLAND")
    print()
    
    # 8. Check FINALlist should be subset of MASTER
    print("8. FINALlist vs MASTER")
    print("-" * 80)
    final_normalized = {e['normalized'] for e in all_lists['FINAL']}
    master_normalized_set = {e['normalized'] for e in all_lists['MASTER']}
    
    in_final_not_master = final_normalized - master_normalized_set
    if in_final_not_master:
        print(f"  FINALlist has {len(in_final_not_master)} entries not in MASTER:")
        for norm in sorted(in_final_not_master):
            for entry in all_lists['FINAL']:
                if entry['normalized'] == norm:
                    print(f"    - {entry['full_name']}")
                    break
    else:
        print("  ✓ All FINALlist entries are in MASTER")
    print()
    
    # 9. Check GROOMFAM should be subset of MASTER
    print("9. GROOMFAM vs MASTER")
    print("-" * 80)
    groomfam_normalized = {e['normalized'] for e in all_lists['GROOMFAM']}
    
    in_groomfam_not_master = groomfam_normalized - master_normalized_set
    if in_groomfam_not_master:
        print(f"  GROOMFAM has {len(in_groomfam_not_master)} entries not in MASTER:")
        for norm in sorted(in_groomfam_not_master):
            for entry in all_lists['GROOMFAM']:
                if entry['normalized'] == norm:
                    print(f"    - {entry['full_name']}")
                    break
    else:
        print("  ✓ All GROOMFAM entries are in MASTER")
    print()
    
    # 10. Summary statistics
    print("=" * 80)
    print("SUMMARY STATISTICS")
    print("=" * 80)
    print(f"MASTERGUESTLIST: {len(all_lists['MASTER'])} entries")
    print(f"FINALlist: {len(all_lists['FINAL'])} entries")
    print(f"OFFISLAND: {len(all_lists['OFFISLAND'])} entries")
    print(f"BLIST: {len(all_lists['BLIST'])} entries")
    print(f"GLIST: {len(all_lists['GLIST'])} entries")
    print(f"GROOMFAM: {len(all_lists['GROOMFAM'])} entries")
    print(f"ATTENDEES_BRIDE: {len(all_lists['ATTENDEES_BRIDE'])} entries")
    print(f"ATTENDEES_GROOM: {len(all_lists['ATTENDEES_GROOM'])} entries")
    print()
    print(f"BLIST + GLIST = {len(blist_normalized) + len(glist_normalized)} unique entries")
    print(f"MASTER minus OFFISLAND = {len(master_minus_offisland)} entries")
    print()

if __name__ == '__main__':
    main()
