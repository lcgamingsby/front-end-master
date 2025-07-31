import React from "react";

// Data dari gambar (mengabaikan banner/peringatan kuning)
const schedules = [
  { month: "Januari 2025",   date: "Jumat, 10 Januari 2025" },
  { month: "Februari 2025",  date: "Jumat, 14 Februari 2025" },
  { month: "Maret 2025",     date: "Jumat, 14 Maret 2025" },
  { month: "April 2025",     date: "Jumat, 11 April 2025" },
  { month: "Mei 2025",       date: "Jumat, 09 Mei 2025" },
  { month: "Juni 2025",      date: "Jumat, 13 Juni 2025" },
  { month: "Juli 2025",      date: "Jumat, 11 Juli 2025" },
  { month: "Agustus 2025",   date: "Jumat, 08 Agustus 2025" },
  { month: "September 2025", date: "Jumat, 12 September 2025" },
  { month: "Oktober 2025",   date: "Jumat, 10 Oktober 2025" },
  { month: "November 2025",  date: "Jumat, 14 November 2025" },
  { month: "Desember 2025",  date: "Jumat, 12 Desember 2025" },
];

const S1 = "14.00-16.30";
const S2 = "16.30-19.00";

const styles = {
  root: { width: "100%", maxWidth: 1000, margin: "0 auto" },
  title: { fontSize: 20, fontWeight: 700, margin: "12px 0 6px" },
  note: { fontSize: 14, opacity: 0.85, marginBottom: 12 },
  grid: {
    display: "flex",
    flexWrap: "wrap",
    gap: 12
  },
  tableWrap: {
    flex: "1 1 460px",        // 2 kolom di layar lebar, 1 kolom di layar sempit
    minWidth: 320,
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
    overflow: "hidden"
  },
  tableTitle: {
    padding: "10px 12px",
    background: "#f8fafc",
    borderBottom: "1px solid #e5e7eb",
    fontWeight: 700
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 14
  },
  th: {
    borderBottom: "1px solid #e5e7eb",
    padding: "10px 8px",
    textAlign: "left",
    background: "#f9fafb",
    fontWeight: 700,
    whiteSpace: "nowrap"
  },
  td: {
    borderTop: "1px solid #f1f5f9",
    padding: "10px 8px",
    verticalAlign: "top"
  },
  tdCenter: { textAlign: "center" },
  month: { fontWeight: 600 },
  badge: {
    display: "inline-block",
    fontSize: 12,
    padding: "2px 8px",
    borderRadius: 999,
    background: "#eef2ff",
    marginLeft: 8
  }
};

// Bagi data jadi 2 tabel agar ringkas (Jan–Jun, Jul–Des)
const firstHalf  = schedules.slice(0, 6);
const secondHalf = schedules.slice(6);

function ScheduleTable({ title, rows }) {
  return (
    <div style={styles.tableWrap}>
      <div style={styles.tableTitle}>{title}</div>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={{ ...styles.th, width: "28%" }}>Bulan</th>
            <th style={{ ...styles.th, width: "36%" }}>Tanggal</th>
            <th style={{ ...styles.th, textAlign: "center", width: "18%" }}>Sesi 1</th>
            <th style={{ ...styles.th, textAlign: "center", width: "18%" }}>Sesi 2</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ month, date }) => (
            <tr key={month}>
              <td style={styles.td}>
                <span style={styles.month}>{month}</span>
                <span style={styles.badge}>2 sesi</span>
              </td>
              <td style={styles.td}>{date}</td>
              <td style={{ ...styles.td, ...styles.tdCenter }}>{S1}</td>
              <td style={{ ...styles.td, ...styles.tdCenter }}>{S2}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TecSchedule() {
  return (
    <div style={styles.root}>
      <h3 style={styles.title}>Jadwal Tes TEC 2025</h3>
      <p style={styles.note}>
        Tes TEC akan dilaksanakan pada hari Jumat setiap bulannya. Setiap bulan terdiri dari 2 sesi: {" "}
        <strong>Sesi 1</strong> pukul {S1} dan <strong>Sesi 2</strong> pukul {S2}.
      </p>

      <div style={styles.grid}>
        <ScheduleTable title="Januari - Juni" rows={firstHalf} />
        <ScheduleTable title="Juli - Desember" rows={secondHalf} />
      </div>
    </div>
  );
}
