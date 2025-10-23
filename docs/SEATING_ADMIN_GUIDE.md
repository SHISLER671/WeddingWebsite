# Seating Assignment Admin Guide

## 🛡️ Mismatch Prevention Strategies

### 1. **Name Normalization (Implemented)**
The system now uses fuzzy matching that handles:
- ✅ Case insensitive matching (`John Smith` = `john smith`)
- ✅ Partial name matching (`John` will find `John Smith`)
- ✅ Extra spaces are trimmed automatically
- ✅ First name or last name searches work

### 2. **Admin Tools for Validation**

#### **Search for Guests:**
```bash
# Exact name search
node scripts/admin-seating.js search "John Smith"

# Fuzzy search (finds partial matches)
node scripts/admin-seating.js fuzzy "john"
node scripts/admin-seating.js fuzzy "smith"
```

#### **Validate All Assignments:**
```bash
# Check for duplicate seats, missing plus-ones, etc.
node scripts/admin-seating.js validate
```

#### **Export for Review:**
```bash
# Export all assignments to CSV for review
node scripts/admin-seating.js export
```

### 3. **Best Practices for Guest List Import**

#### **Name Formatting:**
- ✅ Use consistent formatting: "First Last"
- ✅ Avoid nicknames in the database (use full names)
- ✅ Include common variations in notes field

#### **Example CSV Format:**
```csv
guest_name,email,table_number,seat_number,plus_one_name,plus_one_seat,dietary_notes,special_notes
John Smith,,1,1,Jane Smith,2,Vegetarian,Also known as Johnny
Sarah Johnson,,1,3,,,,
```

### 4. **Guest Communication Strategy**

#### **Pre-Wedding Communication:**
- 📧 Send RSVP link with clear instructions
- 📝 Include note: "Please use your full name as it appears on the invitation"
- 🔄 Provide a contact method for name corrections

#### **RSVP Form Instructions:**
- Add helper text: "Enter your name exactly as it appears on your invitation"
- Include examples: "John Smith" not "Johnny" or "J. Smith"

### 5. **Troubleshooting Common Issues**

#### **Guest Can't Find Their Seating:**
1. **Check the name format** in your database
2. **Try fuzzy search** to find similar names
3. **Check for typos** in the original import
4. **Add alternative names** to the special_notes field

#### **Duplicate Seats:**
1. **Run validation** to find conflicts
2. **Check table assignments** manually
3. **Reassign conflicting guests**

#### **Missing Plus-Ones:**
1. **Validate assignments** to find missing plus-one seats
2. **Update the database** with correct plus-one information
3. **Contact guests** to confirm plus-one details

## 🔧 Admin Workflow

### **Step 1: Import Guest List**
```bash
# Import your guest list
node scripts/import-seating.js your-guest-list.csv
```

### **Step 2: Validate Assignments**
```bash
# Check for issues
node scripts/admin-seating.js validate
```

### **Step 3: Test with Sample Guests**
```bash
# Search for test guests
node scripts/admin-seating.js search "John Smith"
node scripts/admin-seating.js fuzzy "john"
```

### **Step 4: Export for Review**
```bash
# Export to CSV for final review
node scripts/admin-seating.js export
```

## 📋 Pre-Wedding Checklist

- [ ] Import all guest names with consistent formatting
- [ ] Run validation to check for duplicate seats
- [ ] Test fuzzy search with common name variations
- [ ] Export final list for review
- [ ] Send RSVP instructions to guests
- [ ] Have backup plan for name mismatches

## 🆘 Emergency Procedures

### **If Guest Can't Find Seating:**
1. **Search the database** for their name
2. **Try fuzzy search** with partial names
3. **Check for typos** in the original data
4. **Manually assign** if needed
5. **Update the database** with correct information

### **If Duplicate Seats Found:**
1. **Run validation** to identify conflicts
2. **Reassign one of the conflicting guests**
3. **Update the database** immediately
4. **Notify affected guests** if necessary

## 💡 Pro Tips

1. **Use full names** in the database, not nicknames
2. **Include common variations** in the special_notes field
3. **Test the system** with sample guests before going live
4. **Keep a backup** of your guest list
5. **Have a contact method** for guests to report name issues
6. **Use the fuzzy search** to help guests find their seating
7. **Export regularly** to keep backups of your assignments

## 🎯 Success Metrics

- ✅ All guests can find their seating assignments
- ✅ No duplicate seat assignments
- ✅ Plus-ones properly assigned
- ✅ Dietary restrictions noted
- ✅ Special requirements documented
- ✅ Easy admin management
- ✅ Guest-friendly experience
