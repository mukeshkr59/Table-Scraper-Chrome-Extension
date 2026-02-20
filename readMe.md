# Table Data Scraper Chrome Extension

For this extension the permission I am going to use in menifest file are "activeTab" for getting tab access, "download" to download table data from tab and "scripting" for performing operation via background.js

In background.js I have these functions

1. first to check weather the tab has valid url and not on an internal page of browser
2. Now to extract the table data we have function "scrapeTableData" along with a function to convert table data to CSV file.
3. finally, we create a blob with CSV content because it is not possible to download string data directly from the browser.
4. so, we have to create a temporary object (url) to download file, then we can remove this from memory.
5. It will detect all the table from tab and put them in single csv file with (3 row gap in the tables) to download.
