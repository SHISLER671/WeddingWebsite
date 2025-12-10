#!/usr/bin/env python3
"""
Compare ATTENDEESBride.csv and ATTENDEESGroom.csv with MASTERGUESTLIST.csv
to find names that appear in attendees lists but not in master list.
"""

import csv
import re

def normalize_name(name):
    """Normalize name for comparison"""
    if not name:
        return ""
    # Remove common prefixes
    name = re.sub(r'^(Uncle|Auntie|Nino|Nina|Untle|Fr\.)\s+', '', name, flags=re.IGNORECASE)
    # Remove common suffixes
    name = re.sub(r'\s*&\s*Guest\s*$', '', name, flags=re.IGNORECASE)
    name = re.sub(r'\s*and\s*Guest\s*$', '', name, flags=re.IGNORECASE)
    # Remove extra spaces
    name = ' '.join(name.split())
    return name.lower().strip()

def read_csv_names(filename):
    """Read names from CSV file"""
    names = []
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            header = next(reader)  # Skip header
            for row in reader:
                if row and len(row) >= 2 and row[1].strip():
                    names.append(row[1].strip())
    except FileNotFoundError:
        print(f"⚠️  File not found: {filename}")
    return names

# Read all three files
master_names = read_csv_names('MASTERGUESTLIST.csv')
bride_names = read_csv_names('ATTENDEESBride.csv')
groom_names = read_csv_names('ATTENDEESGroom.csv')

# Create normalized sets for comparison
master_normalized = {normalize_name(name): name for name in master_names}
bride_normalized = {normalize_name(name): name for name in bride_names}
groom_normalized = {normalize_name(name): name for name in groom_names}

# Find names in bride list not in master
bride_missing = []
for norm, original in bride_normalized.items():
    if norm and norm not in master_normalized:
        bride_missing.append(original)

# Find names in groom list not in master
groom_missing = []
for norm, original in groom_normalized.items():
    if norm and norm not in master_normalized:
        groom_missing.append(original)

# Print results
print("=" * 60)
print("COMPARISON RESULTS")
print("=" * 60)
print(f"\n📋 MASTERGUESTLIST.csv: {len(master_names)} entries")
print(f"👰 ATTENDEESBride.csv: {len(bride_names)} entries")
print(f"🤵 ATTENDEESGroom.csv: {len(groom_names)} entries")

if bride_missing:
    print(f"\n❌ Names in ATTENDEESBride.csv NOT in MASTERGUESTLIST.csv ({len(bride_missing)}):")
    for name in sorted(bride_missing):
        print(f"   - {name}")
else:
    print("\n✅ All names in ATTENDEESBride.csv are in MASTERGUESTLIST.csv")

if groom_missing:
    print(f"\n❌ Names in ATTENDEESGroom.csv NOT in MASTERGUESTLIST.csv ({len(groom_missing)}):")
    for name in sorted(groom_missing):
        print(f"   - {name}")
else:
    print("\n✅ All names in ATTENDEESGroom.csv are in MASTERGUESTLIST.csv")

print("\n" + "=" * 60)
