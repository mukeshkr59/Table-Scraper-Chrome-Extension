// Listen for clicks on the extension 
chrome.action.onClicked.addListener((tab) => {
  // if we have a valid url
  if ( tab.url && !tab.url.startsWith("chrome://") && !tab.url.startsWith("edge://") ) {

      chrome.scripting.executeScript({ target:{ tabId: tab.id }, function: scrapeTableData, });

  } else {
    console.error("Cannot scrape data from this page");
    // ! on the icon on error for 2 sec
    chrome.action.setBadgeText({ text: "!" });
    setTimeout(() => {
      chrome.action.setBadgeText({ text: "" });
    }, 2000);
  }
});

// This function will be injected into the active tab
function scrapeTableData() {
  try {
    // Find all tables on the page
    const tables = document.querySelectorAll("table");

    if (tables.length === 0) {
      alert("No tables found on this page!");
      return;
    }

    // Scrape all tables and combine them
    const allCSVData = [];
    let successCount = 0;

    tables.forEach((table, index) => {
      try {
        // Extract data from each table
        const csvData = tableToCSV(table);

        if (csvData) {
          allCSVData.push(csvData);
          successCount++;
        }
      } catch (error) {
        console.error(`Error scraping table ${index + 1}:`, error);
      }
    });

    if (successCount > 0) {
      const gap = "\n\n\n"; // 3 empty rows
      const combinedCSV = allCSVData.join(gap);

      downloadCSV(combinedCSV);
      alert(`Successfully scraped ${successCount} table(s)`);
    } else {
      alert("Failed to extract data");
    }
  } catch (error) {
    console.error("Error scraping tables:", error);
    alert("Error scraping tables: " + error.message);
  }

  // HTML table to CSV 
  function tableToCSV(table) {
    const rows = table.querySelectorAll("tr");
    const csvRows = [];

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td, th");
      const csvCells = [];

      cells.forEach((cell) => {
        // Get cell text and clean it
        let text = cell.innerText || cell.textContent || "";

        // Remove extra whitespace adn newline
        text = text.trim().replace(/\s+/g, " ");

        csvCells.push(text);
      });

      if (csvCells.length > 0) {
        csvRows.push(csvCells.join(","));
      }
    });

    return csvRows.join("\n");
  }

  // Download CSV file
  function downloadCSV(csvContent) {
    // Creating a Blob with CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    // Creating a temporary download link
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    // Generating filename 
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -5);
    const filename = `table-data-${timestamp}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";

    // Append to body, click, and remove
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clearing the memory used fir url obj.
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);

    console.log("CSV downloaded successfully!");
  }
}
