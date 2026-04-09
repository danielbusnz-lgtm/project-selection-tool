# Project Selection Tool - Setup Guide

## Step 1: Create Your Product List (Google Sheets)

1. Go to [sheets.google.com](https://sheets.google.com)
2. Click **Blank** to create a new spreadsheet
3. Name it something like "Product Selections"

### Set Up Your Columns

In the first row, add these headers:

| A | B |
|---|---|
| category | name |

### Add Your Products

Add one product per row. The **category** column determines which step it appears in.

Example:

| category | name |
|----------|------|
| Vanity | 36" White Shaker |
| Vanity | 48" Gray Flat Panel |
| Vanity | 60" Espresso |
| Countertop | White Quartz 2cm |
| Countertop | Gray Granite 3cm |
| Sink | White Undermount Rectangle |
| Sink | Biscuit Vessel Oval |
| Faucet | Chrome Single Handle |
| Faucet | Brushed Nickel Widespread |

The order of categories in your sheet = the order of steps in the app.

---

## Step 2: Publish Your Sheet

1. In Google Sheets, go to **File → Share → Publish to web**
2. In the first dropdown, select your sheet name (or "Entire document")
3. In the second dropdown, change "Web page" to **"Comma-separated values (.csv)"**
4. Click the green **Publish** button
5. Click **OK** on the popup
6. **Copy the URL** that appears

It will look something like:
```
https://docs.google.com/spreadsheets/d/e/2PACX-abc123.../pub?output=csv
```

---

## Step 3: Connect to the App

1. Open the app: **[YOUR-VERCEL-URL-HERE]**
2. Paste your Google Sheets URL in the box
3. Click **Save & Continue**

Done! Your products now appear in the selection wizard.

---

## Updating Products

To add, remove, or edit products:

1. Just edit your Google Sheet (add rows, change names, etc.)
2. Changes are automatic - users just need to refresh the page

No need to republish. Edit the sheet anytime.

---

## Tips

- Keep category names consistent (capitalization matters)
- Add new categories by just typing a new category name
- The app steps through categories in the order they first appear in the sheet
- You can add extra columns (like "price" or "notes") - they won't break anything

---

## Need Help?

Contact: [YOUR NAME/EMAIL HERE]
