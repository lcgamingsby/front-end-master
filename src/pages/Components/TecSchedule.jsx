import React from "react";

// Data dari gambar (mengabaikan banner/peringatan kuning)
const schedules = [
  { month: "Januari 2025",   date: "Jumat, 10-01-2025" },
  { month: "Februari 2025",  date: "Jumat, 14-02-2025" },
  { month: "Maret 2025",     date: "Jumat, 14-03-2025" },
  { month: "April 2025",     date: "Jumat, 11-04-2025" },
  { month: "Mei 2025",       date: "Jumat, 09-05-2025" },
  { month: "Juni 2025",      date: "Jumat, 13-06-2025" },
  { month: "Juli 2025",      date: "Jumat, 11-07-2025" },
  { month: "Agustus 2025",   date: "Jumat, 08-08-2025" },
  { month: "September 2025", date: "Jumat, 12-09-2025" },
  { month: "Oktober 2025",   date: "Jumat, 10-10-2025" },
  { month: "November 2025",  date: "Jumat, 14-11-2025" },
  { month: "Desember 2025",  date: "Jumat, 12-12-2025" },
];

const S1 = "14:00-16:30";
const S2 = "16:30-19:00";

// Bagi data jadi 2 tabel agar ringkas (Jan–Jun, Jul–Des)
const firstHalf  = schedules.slice(0, 6);
const secondHalf = schedules.slice(6);

function ScheduleTable({ title, rows }) {
  return (
    <div
      className="flex-1 min-w-80 bg-white border border-slate-400 rounded-xl
      shadow-sm overflow-hidden"
    >
      <div className="py-2.5 px-3 bg-slate-100 font-bold border-b border-slate-400">
        {title}
      </div>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            <th
              className="py-2.5 px-2 text-center bg-slate-100 font-bold whitespace-nowrap w-3/12"
            >
              Bulan
            </th>
            <th className="py-2.5 px-2 text-center bg-slate-100 font-bold whitespace-nowrap w-5/12"
            >
              Tanggal
            </th>
            <th className="py-2.5 px-2 text-center bg-slate-100 font-bold whitespace-nowrap w-2/12"
            >
              Sesi 1
            </th>
            <th className="py-2.5 px-2 text-center bg-slate-100 font-bold whitespace-nowrap w-2/12"
            >
              Sesi 2
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ month, date }) => (
            <tr key={month}>
              <td className="border-t border-slate-400 py-2.5 px-2 align-top">
                <span className="font-semibold">{month}</span>
                <span className="inline-block text-xs py-0.5 px-2 rounded-full bg-slate-200 ml-2">2 sesi</span>
              </td>
              <td className="border-t border-slate-400 py-2.5 px-2 align-top">{date}</td>
              <td className="border-t border-slate-400 py-2.5 px-2 align-top text-center">{S1}</td>
              <td className="border-t border-slate-400 py-2.5 px-2 align-top text-center">{S2}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TecSchedule() {
  return (
    <div className="mx-auto">
      <h3 className="text-xl font-bold mt-3 mb-1.5 text-tec-dark px-4 sm:px-10">Jadwal Tes TEC 2025</h3>
      <p className="text-sm mb-3 px-4 sm:px-10">
        Tes TEC akan dilaksanakan pada hari Jumat setiap bulannya. Setiap bulan terdiri dari 2 sesi: <br />
        <strong>Sesi 1</strong> pukul {S1} dan <strong>Sesi 2</strong> pukul {S2}.
      </p>

      <div className="flex flex-wrap gap-3 text-slate-800 px-2 sm:px-4">
        <ScheduleTable title="Januari - Juni" rows={firstHalf} />
        <ScheduleTable title="Juli - Desember" rows={secondHalf} />
      </div>
    </div>
  );
}
