const PDFDocument = require('pdfkit');

/**
 * PDF Report Generator
 *
 * Creates a professionally styled weekly nutrition report as a PDF stream.
 * Uses PDFKit to render sections: user info, daily nutrient table,
 * deficiency alerts, and snack suggestions.
 *
 * @param {Object} userData     - User profile from MongoDB
 * @param {Object} weeklyData  - { dailyBreakdown: [...], averages: {...} }
 * @param {Array}  deficiencies - Array of deficiency objects from nutritionService
 * @param {Array}  suggestions  - Array of snack suggestion objects
 * @returns {PDFDocument} A readable stream that can be piped to the HTTP response
 */
const generateReport = (userData, weeklyData, deficiencies, suggestions) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // ─── Color palette ───
  const colors = {
    primary: '#6366f1',
    dark: '#1a1a2e',
    text: '#333333',
    lightGray: '#f0f0f0',
    critical: '#ef4444',
    moderate: '#f59e0b',
    low: '#22c55e',
  };

  // ─── Header Section ───
  doc
    .rect(0, 0, doc.page.width, 100)
    .fill(colors.primary);

  doc
    .font('Helvetica-Bold')
    .fontSize(24)
    .fillColor('#ffffff')
    .text('Weekly Nutrition Report', 50, 30, { align: 'center' });

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor('#e0e0ff')
    .text('AI-Powered Hostel Nutrition & Health Monitoring System', 50, 60, { align: 'center' });

  doc.moveDown(2);
  doc.y = 120; // Reset y position after header

  // ─── User Info Section ───
  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor(colors.primary)
    .text('User Information', 50);

  doc.moveDown(0.5);

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(colors.text);

  const userInfo = [
    ['Name', userData.name || 'Not set'],
    ['Age', userData.age ? `${userData.age} years` : 'Not set'],
    ['Gender', userData.gender ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1) : 'Not set'],
    ['Daily Budget', `Rs. ${userData.dailyBudget || 150}`],
    ['Food Preference', userData.foodPreference ? userData.foodPreference.charAt(0).toUpperCase() + userData.foodPreference.slice(1) : 'Veg'],
    ['Activity Level', userData.activityLevel || 'Moderate'],
  ];

  for (const [label, value] of userInfo) {
    doc.text(`${label}: ${value}`, 70);
  }

  doc.moveDown(1);

  // ─── Date Range ───
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(colors.primary)
    .text(`Report Period: ${startDate.toLocaleDateString('en-IN')} – ${endDate.toLocaleDateString('en-IN')}`, 50);

  doc.moveDown(1);

  // ─── Daily Nutrient Summary Table ───
  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor(colors.primary)
    .text('Daily Nutrient Summary', 50);

  doc.moveDown(0.5);

  // Table header
  const tableTop = doc.y;
  const colWidths = [90, 75, 75, 75, 75, 75];
  const headers = ['Date', 'Calories', 'Protein (g)', 'Carbs (g)', 'Fat (g)', 'Iron (mg)'];

  doc
    .rect(50, tableTop, 465, 20)
    .fill(colors.primary);

  let xPos = 50;
  headers.forEach((header, i) => {
    doc
      .font('Helvetica-Bold')
      .fontSize(9)
      .fillColor('#ffffff')
      .text(header, xPos + 5, tableTop + 5, { width: colWidths[i] - 10, align: 'center' });
    xPos += colWidths[i];
  });

  // Table rows
  let rowY = tableTop + 22;
  const dailyBreakdown = weeklyData.dailyBreakdown || [];

  dailyBreakdown.forEach((day, index) => {
    // Alternate row background for readability
    if (index % 2 === 0) {
      doc
        .rect(50, rowY, 465, 18)
        .fill(colors.lightGray);
    }

    const rowData = [
      day.date || '—',
      Math.round(day.calories || 0).toString(),
      Math.round(day.protein || 0).toString(),
      Math.round(day.carbs || 0).toString(),
      Math.round(day.fat || 0).toString(),
      (day.iron || 0).toFixed(1),
    ];

    xPos = 50;
    rowData.forEach((cell, i) => {
      doc
        .font('Helvetica')
        .fontSize(9)
        .fillColor(colors.text)
        .text(cell, xPos + 5, rowY + 4, { width: colWidths[i] - 10, align: 'center' });
      xPos += colWidths[i];
    });

    rowY += 18;
  });

  // If no data, show a message
  if (dailyBreakdown.length === 0) {
    doc
      .fontSize(10)
      .fillColor('#999')
      .text('No meal data recorded for this period.', 50, rowY + 5);
    rowY += 25;
  }

  doc.y = rowY + 15;

  // ─── Averages Section ───
  if (weeklyData.averages) {
    doc
      .font('Helvetica-Bold')
      .fontSize(14)
      .fillColor(colors.primary)
      .text('Weekly Averages', 50);

    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10).fillColor(colors.text);

    const avg = weeklyData.averages;
    doc.text(`Calories: ${Math.round(avg.calories || 0)} kcal/day`, 70);
    doc.text(`Protein: ${Math.round(avg.protein || 0)} g/day`, 70);
    doc.text(`Carbs: ${Math.round(avg.carbs || 0)} g/day`, 70);
    doc.text(`Fat: ${Math.round(avg.fat || 0)} g/day`, 70);
    doc.text(`Iron: ${(avg.iron || 0).toFixed(1)} mg/day`, 70);

    doc.moveDown(1);
  }

  // ─── Deficiency Alerts Section ───
  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor(colors.primary)
    .text('Deficiency Alerts', 50);

  doc.moveDown(0.5);

  if (deficiencies.length === 0) {
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(colors.low)
      .text('✅ No significant deficiencies detected. Great job!', 70);
  } else {
    for (const d of deficiencies) {
      // Pick a color based on severity
      const severityColor =
        d.severity === 'critical' ? colors.critical :
        d.severity === 'moderate' ? colors.moderate :
        colors.low;

      // Elegant deficiency listing
      const nutrientName = d.nutrient.charAt(0).toUpperCase() + d.nutrient.slice(1).toLowerCase();
      
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(severityColor)
        .text(`•  ${nutrientName}: `, 70, doc.y, { continued: true })
        .font('Helvetica')
        .fillColor(colors.text)
        .text(`Currently at ${d.percentage}% of target `, { continued: true })
        .fillColor('#94a3b8')
        .text(`(${d.current} / ${d.recommended})`);
    }
  }

  doc.moveDown(1);

  // ─── Snack Suggestions Section ───
  doc
    .font('Helvetica-Bold')
    .fontSize(14)
    .fillColor(colors.primary)
    .text('Smart Snack Suggestions', 50);

  doc.moveDown(0.5);

  if (suggestions.length === 0) {
    doc
      .font('Helvetica')
      .fontSize(10)
      .fillColor(colors.text)
      .text('No specific suggestions — your nutrition looks balanced!', 70);
  } else {
    for (const s of suggestions) {
      doc
        .font('Helvetica-Bold')
        .fontSize(10)
        .fillColor(colors.text)
        .text(`•  ${s.name} `, 70, doc.y, { continued: true })
        .font('Helvetica')
        .fillColor('#64748b')
        .text(`— Rs. ${s.estimatedCost} `, { continued: true })
        .fillColor('#94a3b8')
        .text(`(${s.reason})`);
    }
  }

  doc.moveDown(2);

  // ─── Footer ───
  doc
    .font('Helvetica')
    .fontSize(8)
    .fillColor('#999999')
    .text(
      `Generated on ${new Date().toLocaleString('en-IN')} | NutriTrack — AI-Powered Hostel Nutrition Monitoring`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

  // Finalize the PDF
  doc.end();

  return doc;
};

module.exports = { generateReport };
