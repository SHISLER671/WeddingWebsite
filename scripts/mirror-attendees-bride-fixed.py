#!/usr/bin/env python3
"""
Script to make MASTERGUESTLIST mirror ATTENDEESBride.csv names exactly
while preserving all existing entries (including groom's side)
"""

import csv
import re

def normalize_name(name):
    """Normalize name for comparison"""
    # Remove common prefixes
    name = re.sub(r'^(Uncle|Auntie|Nino|Nina|Untle|Fr\.)\s+', '', name, flags=re.IGNORECASE)
    # Remove extra spaces
    name = ' '.join(name.split())
    return name.lower().strip()

def extract_key_parts(name):
    """Extract key identifying parts of a name"""
    name = normalize_name(name)
    parts = re.split(r'\s+&\s+|\s+and\s+', name, flags=re.IGNORECASE)
    key_parts = []
    for part in parts:
        words = part.split()
        if words:
            key_parts.append(words[-1])  # Last name
            if len(words) > 1:
                key_parts.append(words[0])  # First name
    return set(key_parts)

def names_match(name1, name2):
    """Check if two names likely refer to the same person"""
    norm1 = normalize_name(name1)
    norm2 = normalize_name(name2)
    
    if norm1 == norm2:
        return True
    
    parts1 = extract_key_parts(name1)
    parts2 = extract_key_parts(name2)
    
    if parts1 and parts2:
        overlap = parts1.intersection(parts2)
        if len(overlap) >= 2:
            return True
        if len(parts1) == 1 and len(parts2) == 1 and len(overlap) == 1:
            return True
    
    return False

def main():
    # Read ATTENDEESBride.csv - this is the source of truth for bride's side names
    attendees_map = {}
    kid_entourage_names = set()
    
    with open('ATTENDEESBride.csv', 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            if row and len(row) >= 2:
                name = row[1].strip()
                notes = row[2].strip() if len(row) > 2 else ''
                headcount = row[3].strip() if len(row) > 3 else ''
                kid_entourage_col = row[5].strip() if len(row) > 5 else ''
                
                # Check KIDENTOURAGE column
                if 'KIDENTOURAGE' in kid_entourage_col.upper():
                    kid_entourage_names.add(normalize_name(name))
                
                # Store for matching - use normalized name as key
                attendees_map[normalize_name(name)] = {
                    'name': name,
                    'notes': notes,
                    'headcount': headcount,
                }
    
    # Read current MASTERGUESTLIST.csv - preserve all entries
    master_entries = []
    seen_names = set()
    
    with open('MASTERGUESTLIST.csv', 'r', encoding='utf-8') as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            if row and len(row) >= 2:
                name = row[1].strip()
                if not name:
                    continue
                norm_name = normalize_name(name)
                
                # Skip duplicates based on normalized name
                if norm_name in seen_names:
                    print(f"  Skipping duplicate: {name}")
                    continue
                seen_names.add(norm_name)
                
                master_entries.append({
                    'name': name,
                    'notes': row[2].strip() if len(row) > 2 else '',
                    'headcount': row[3].strip() if len(row) > 3 else '',
                    'rsvp': row[4].strip() if len(row) > 4 else '',
                })
    
    # Update master entries to match ATTENDEESBride names where they match
    updated_entries = []
    updated_count = 0
    matched_attendee_names = set()  # Track which attendees have been matched
    updated_entry_names = set()  # Track entries we've already added to avoid duplicates
    
    for master in master_entries:
        norm_master = normalize_name(master['name'])
        matched = False
        matched_attendee_key = None
        
        # Check if this master entry matches any attendee
        for norm_attendee, attendee_data in attendees_map.items():
            if names_match(master['name'], attendee_data['name']):
                matched = True
                matched_attendee_key = norm_attendee
                norm_updated = normalize_name(attendee_data['name'])
                
                # Only add if we haven't already added this entry
                if norm_updated not in updated_entry_names:
                    updated_entry_names.add(norm_updated)
                    # Update to match ATTENDEESBride exactly
                    updated_entries.append({
                        'name': attendee_data['name'],
                        'notes': attendee_data['notes'],
                        'headcount': attendee_data['headcount'],
                        'rsvp': master['rsvp'],  # Preserve RSVP status
                    })
                    if master['name'] != attendee_data['name']:
                        updated_count += 1
                break
        
        if matched and matched_attendee_key:
            matched_attendee_names.add(matched_attendee_key)
        
        if not matched:
            # Keep original entry (groom's side or not in ATTENDEESBride)
            norm_original = normalize_name(master['name'])
            if norm_original not in updated_entry_names:
                updated_entry_names.add(norm_original)
                updated_entries.append(master)
    
    # Add any attendees that weren't matched (new entries)
    for norm_attendee, attendee_data in attendees_map.items():
        if norm_attendee not in matched_attendee_names:
            norm_new = normalize_name(attendee_data['name'])
            if norm_new not in updated_entry_names:
                updated_entry_names.add(norm_new)
                updated_entries.append({
                    'name': attendee_data['name'],
                    'notes': attendee_data['notes'],
                    'headcount': attendee_data['headcount'],
                    'rsvp': '',
                })
                print(f"  Adding new: {attendee_data['name']}")
    
    # Sort alphabetically by name (ignoring prefixes)
    def sort_key(entry):
        name = normalize_name(entry['name'])
        return name
    
    updated_entries.sort(key=sort_key)
    
    # Write updated MASTERGUESTLIST with KIDENTOURAGE column
    with open('MASTERGUESTLIST.csv', 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        # Write header with new column
        writer.writerow(['Number', 'Full Name', 'Notes', 'Headcount', 'RSVP Status', 'KIDENTOURAGE'])
        
        # Write entries with numbering
        for i, entry in enumerate(updated_entries, start=1):
            # Check if this entry should have KIDENTOURAGE
            norm_name = normalize_name(entry['name'])
            kid_entourage = 'Yes' if norm_name in kid_entourage_names else ''
            
            writer.writerow([
                str(i),
                entry['name'],
                entry['notes'],
                entry['headcount'],
                entry['rsvp'],
                kid_entourage
            ])
    
    print(f"\n✅ Updated MASTERGUESTLIST.csv")
    print(f"   Total entries: {len(updated_entries)}")
    print(f"   Updated names: {updated_count}")
    print(f"   KIDENTOURAGE entries: {len(kid_entourage_names)}")
    if kid_entourage_names:
        print(f"   KIDENTOURAGE names:")
        for name in sorted(kid_entourage_names):
            print(f"     - {name}")

if __name__ == '__main__':
    main()
