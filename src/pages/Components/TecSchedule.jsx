import React from "react";

const schedules = {
  year: 2025,
  monthly_schedules: [
    {
      display_name: "Januari",
      schedules: [
        "2025-01-10 14:00:00",
        "2025-01-10 16:30:00",
      ],
    },
    {
      display_name: "Februari",
      schedules: [
        "2025-02-14 14:00:00",
        "2025-02-14 16:30:00",
      ],
    },
    {
      display_name: "Maret",
      schedules: [
        "2025-03-14 14:00:00",
        "2025-03-14 16:30:00",
      ],
    },
    {
      display_name: "April",
      schedules: [
        "2025-04-11 14:00:00",
        "2025-04-11 16:30:00",
      ],
    },
    {
      display_name: "Mei",
      schedules: [
        "2025-05-09 14:00:00",
        "2025-05-09 16:30:00",
      ],
    },
    {
      display_name: "Juni",
      schedules: [
        "2025-06-13 14:00:00",
        "2025-06-13 16:30:00",
      ],
    },
    {
      display_name: "Juli",
      schedules: [
        "2025-07-11 14:00:00",
        "2025-07-11 16:30:00",
      ],
    },
    {
      display_name: "Agustus",
      schedules: [
        "2025-08-08 14:00:00",
        "2025-08-08 16:30:00",
      ],
    },
    {
      display_name: "September",
      schedules: [
        "2025-09-12 14:00:00",
        "2025-09-12 16:30:00",
      ],
    },
    {
      display_name: "Oktober",
      schedules: [
        "2025-10-10 14:00:00",
        "2025-10-10 16:30:00",
      ],
    },
    {
      display_name: "November",
      schedules: [
        "2025-11-14 14:00:00",
        "2025-11-14 16:30:00",
      ],
    },
    {
      display_name: "Desember",
      schedules: [
        "2025-12-12 14:00:00",
        "2025-12-12 16:30:00",
      ],
    },
  ],
};

// Bagi data jadi 2 tabel agar ringkas (Jan–Jun, Jul–Des)
const firstHalf  = schedules.monthly_schedules.slice(0, 6);
const secondHalf = schedules.monthly_schedules.slice(6);

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
              className="py-2.5 px-2 text-center bg-slate-100 font-bold whitespace-nowrap w-5/12"
            >
              Bulan
            </th>
            <th
              className="py-2.5 px-2 text-center bg-slate-100 font-bold whitespace-nowrap w-3/12"
            >
              Tanggal
            </th>
            <th
              className="py-2.5 px-2 text-center bg-slate-100 font-bold whitespace-nowrap w-2/12"
            >
              Sesi 1
            </th>
            <th
              className="py-2.5 px-2 text-center bg-slate-100 font-bold whitespace-nowrap w-2/12"
            >
              Sesi 2
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((v, i) => {
            const monthName = v.display_name;
            const monthSchedule = v.schedules;
            let dayMap = {};

            const sessions = monthSchedule.map((v, i) => {
              const dateObj = new Date(v);

              dayMap[dateObj.getDate()] = [...(dayMap[dateObj.getDate()] || []), i];

              return dateObj;
            });
            console.log(dayMap);

            return (
              <tr key={i}>
                <td className="border-t border-slate-400 py-2.5 px-2 align-top text-center">
                  <span className="font-semibold">{monthName + " " + schedules.year}</span><br />
                  <span className="inline-block text-xs py-0.5 px-2 rounded-full bg-slate-200 ml-2">
                    {monthSchedule.length} sesi
                  </span>
                </td>
                <td className="border-t border-slate-400 py-2.5 px-2 align-top text-center">
                  {sessions[0].toLocaleDateString("id-ID").replaceAll("/", "-")}
                </td>
                <td className="border-t border-slate-400 py-2.5 px-2 align-top text-center">{sessions[0].toLocaleTimeString("en-GB", {timeStyle: "short"})}</td>
                <td className="border-t border-slate-400 py-2.5 px-2 align-top text-center">{sessions[1].toLocaleTimeString("en-GB", {timeStyle: "short"})}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function TecSchedule() {
  return (
    <div className="mx-auto">
      <h3 className="text-xl font-bold mt-3 mb-1.5 text-tec-dark px-2 sm:px-4">Jadwal Tes TEC 2025</h3>
      <p className="text-sm mb-3 px-2 sm:px-4">
        Tes TEC akan dilaksanakan pada hari Jumat setiap bulannya dengan jadwal seperti berikut.
      </p>

      <div className="flex flex-wrap gap-3 text-slate-800 px-2 sm:px-4">
        <ScheduleTable title="Januari - Juni" rows={firstHalf} />
        <ScheduleTable title="Juli - Desember" rows={secondHalf} />
      </div>
    </div>
  );
}
