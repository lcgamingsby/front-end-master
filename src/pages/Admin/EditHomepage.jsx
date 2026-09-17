import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaAngleDoubleLeft, FaAngleDoubleRight, FaAngleLeft, FaAngleRight, FaChevronDown, FaChevronLeft, FaFilter } from "react-icons/fa";
import Navbar from "../Components/Navbar";
import axios from "axios";
import { config } from "../../data/config";
import GrammarUnderline from "../Components/GrammarUnderline";
import Loading from "../Components/Loading";
import Snackbar from "../Components/Snackbar";

function EditHomepage() {
  const navigate = useNavigate();

  const [schedule, setSchedule] = useState({});
  const [scheduleJson, setScheduleJson] = useState("");
  const [isLoading, setLoading] = useState(true);

  const [editMode, setEditMode] = useState("visual");
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  const handleError = (err) => {
    let errorType = "ERR_UNKNOWN";
    let errorText = "Unknown error";

    const errResponse = err.response;
    const errMessage = errResponse?.data.message.toLowerCase();

    console.log(errMessage);

    switch (errResponse?.status) {
      case 400:
        // FORM: GEN is general, REA is reading-specific, GRA is grammar-specific, LIS is listening-specific
        if (errMessage.includes("invalid json data")) {
          errorType = "ERR_BAD_REQUEST_HOME_01";
          errorText = "Input JSON is invalid";

        } else if (errMessage.includes("invalid date format on month")) {
          const spaceIdx = errMessage.lastIndexOf(" ");
          const month = parseInt(errMessage.slice(spaceIdx + 1));

          errorType = "ERR_BAD_REQUEST_HOME_02";
          errorText = `Date format on the ${month}${getOrdinalSuffix(month)} month is invalid`;
        }
        break;
      case 500:
        errorType = "ERR_INTERNAL"
        errorText = "Internal server error. Please contact admin"

        break;
      default:
        if (errMessage.includes("network error")) {
          errorType = "ERR_NETWORK";
          errorText = "Network error. Unable to reach the server";
        }
    }

    setSnackbarMsg(`${errorText}.
    (Error: ${errorType === "ERR_UNKNOWN" ? (errorType + " (Status: "+errResponse?.status+")") : errorType})`);
    setOpenSnackbar(true);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (editMode === "json") {
      let scheduleObj = {};
      try {
        scheduleObj = JSON.parse(scheduleJson);

        console.log(scheduleObj);
      } catch (e) {
        console.error("Invalid JSON input");

        let errorType = "ERR_INVALID_JSON";
        let errorText = "Unable to parse JSON string, input JSON is invalid";

        setSnackbarMsg(`${errorText}.
        (Error: ${errorType === "ERR_UNKNOWN" ? (errorType + " (Status: "+errResponse?.status+")") : errorType})`);
        setOpenSnackbar(true);
        return;
      }

      try {
        await axios.post(
          `${config.BACKEND_URL}/api/admin/homepage`,
          scheduleObj,
          { withCredentials: true }
        );

        navigate("/admin");
      } catch (e) {
        console.error("Failed to change homepage data:", e);

        handleError(e);
      }
    } else if (editMode === "visual") {
      // no conversion needed
      console.log(schedule);

      try {
        await axios.post(
          `${config.BACKEND_URL}/api/admin/homepage`,
          schedule,
          { withCredentials: true }
        );

        navigate("/admin");
      } catch (e) {
        console.error("Failed to change homepage data:", e);

        handleError(e);
      }
    }
    // console.log('submitting...');
  }

  const loadSchedule = async () => {
    try {
      const response = await axios.get(`${config.BACKEND_URL}/homedata`);

      if (response.status === 200) {
       const scheduleJson = response.data;

        setSchedule(scheduleJson);
        setScheduleJson(JSON.stringify(scheduleJson));
      }
    } catch (e) {
      console.error("Error loading schedule:", e);
    } finally {
      setLoading(false);
    }
  };

  const tryConvertSchedule = (type) => {
    let success = true;

    if (type === "visual") {
      try {
        const scheduleObj = JSON.parse(scheduleJson);

        if (scheduleObj.monthly_schedules.length < 12) {
          const currentLength = scheduleObj.monthly_schedules.length;
          const remaining = 12 - currentLength;

          for (let i = 0; i < remaining; i++) {
            scheduleObj.monthly_schedules.push({
              "display_name": defaultMonths[currentLength + i],
              "schedules": [
                `${scheduleObj.year}-${currentLength + i}-01 14:00:00`,
                `${scheduleObj.year}-${currentLength + i}-01 16:30:00`,
              ],
            });
          }
        }

        setSchedule(scheduleObj);
      } catch (e) {
        console.error("Invalid JSON input");

        let errorType = "ERR_INVALID_JSON";
        let errorText = "Unable to parse JSON string, input JSON is invalid";

        setSnackbarMsg(`${errorText}.
        (Error: ${errorType === "ERR_UNKNOWN" ? (errorType + " (Status: "+errResponse?.status+")") : errorType})`);
        setOpenSnackbar(true);
        success = false;
      }
    } else if (type === "json") {
      // no error checks needed because the object generated from the UI has no BigInt or circular reference
      const scheduleStr = JSON.stringify(schedule);

      setScheduleJson(scheduleStr);
    } else {
      console.error("Invalid type.");
      success = false;
    }

    return success;
  }

  useEffect(() => {
    loadSchedule();
  }, []);

  const jsonPlaceholder = `{
  year: the year to display for the schedule for every months in number,
  monthly_schedules: a table for monthly schedule objects, like: [
    {
      display_name: the name of the month to display in string (can be in Indonesian or English),
      schedules: a table of date time strings, order it like "YYYY-MM-DD HH:MM:SS"
    }
  ]
}`;

  const ordinalSuffix = [
    "st",
    "nd",
    "rd",
    "th",
  ]

  const defaultMonths = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ]

  const getOrdinalSuffix = (num) => {
    if (num % 10 === 1 && (num % 100 !== 11)) {
      return ordinalSuffix[0];
    }
    if (num % 10 === 2 && (num % 100 !== 12)) {
      return ordinalSuffix[1];
    }
    if (num % 10 === 3 && (num % 100 !== 13)) {
      return ordinalSuffix[2];
    }

    return ordinalSuffix[3];
  }

  return (
    <div className="absolute bg-slate-50 w-full min-h-full h-auto">
      <Navbar />

      {isLoading ? (
        <Loading />
      ) : (
      <main className="p-8">
        <div className="flex gap-2 items-baseline">
          <button
            className="text-tec-darker hover:text-tec-light cursor-pointer"
            onClick={() => navigate("/admin")}
          >
            <FaChevronLeft className="w-6 h-6" />
          </button>
          <h2 className="text-4xl mb-5 text-tec-darker font-bold">Edit Homepage Data</h2>
        </div>

        <div className="flex justify-center mt-6 space-x-4">
          <button
            onClick={() => {
              const success = tryConvertSchedule("visual");

              if (success) {
                setEditMode("visual");
              }
            }}
            className={`px-6 py-2 rounded-t-lg rounded-x-lg font-semibold border-t border-x transition-all duration-150 cursor-pointer ${
              editMode === "visual"
                ? "bg-tec-dark text-white border-tec-dark"
                : "bg-white text-tec-dark border-tec-dark hover:bg-tec-light hover:text-white"
            }`}
            title="Use Visual Editor"
          >
            Visual
          </button>
          <button
            onClick={() => {
              const success = tryConvertSchedule("json");

              if (success) {
                setEditMode("json");
              }
            }}
            className={`px-6 py-2 rounded-t-lg rounded-x-lg font-semibold border-t border-x transition-all duration-150 cursor-pointer ${
              editMode === "json"
                ? "bg-tec-dark text-white border-tec-dark"
                : "bg-white text-tec-dark border-tec-dark hover:bg-tec-light hover:text-white"
            }`}
            title="Use JSON Editor"
          >
            JSON
          </button>
        </div>
        <form className="border-t border-tec-dark pt-3 mb-10" onSubmit={handleSubmit}>
          {editMode === "visual" ? (
            <>
              <label className="text-sm text-tec-darker font-semibold select-none">
                YEAR <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-6 mb-2">
                <input
                  type="number"
                  name="year"
                  id="year"
                  className="w-full px-3 py-2 mb-4 border-2 border-slate-300 focus:outline-none hover:border-tec-light
                    focus:border-tec-light rounded-lg appearance-none"
                  value={schedule.year}
                  onChange={(e) => setSchedule({
                    ...schedule,
                    year: parseInt(e.target.value),
                  })}
                  placeholder="Enter a year (affects all date picker)"
                  required
                />
              </div>

              { schedule.monthly_schedules.map((v, i) => {
                // console.log(`${schedule.year}-${((i % 12) + 1).toString().padStart(2, "0")}-01 00:00:00`);
                return (
                  <>
                    <h3 className="text-lg text-tec-dark font-semibold mt-4">
                      {v.display_name} ({i + 1}{getOrdinalSuffix(i+1)} month)
                    </h3>

                    <label className="text-sm text-tec-darker font-semibold select-none" htmlFor="name">DISPLAY NAME</label>
                    <input
                      type="text"
                      name="display_name"
                      id="display_name"
                      className="w-full px-3 py-2 mb-4 border-2 border-slate-300 focus:outline-none hover:border-tec-light
                        focus:border-tec-light rounded-lg"
                      value={v.display_name}
                      onChange={(e) => {
                        let new_schedule = schedule.monthly_schedules;
                        schedule.monthly_schedules[i] = {
                          ...schedule.monthly_schedules[i],
                          display_name: e.target.value,
                        }

                        // console.log(new_schedule);

                        setSchedule({
                          ...schedule,
                          monthly_schedules: new_schedule,
                        })
                      }}
                      placeholder="Text to display for this month"
                      required
                    />

                    <div className="form-row flex gap-4 mt-4">
                      <div className="flex-1">
                        <label className="text-sm text-tec-darker font-semibold select-none" htmlFor="session1_datetime">SESSION 1</label>
                        <input
                          type="datetime-local"
                          name="session1_datetime"
                          id="session1_datetime"
                          className="w-full p-2.5 mb-4 border-2 border-slate-300 focus:outline-none hover:border-tec-light
                          focus:border-tec-light rounded-lg"
                          required
                          min={`${schedule.year}-01-01 00:00:00`}
                          max={`${schedule.year}-12-31 23:59:59`}
                          value={v.schedules[0]}
                          onChange={(e) => {
                            let new_schedule = schedule.monthly_schedules;
                            let session_schedule = new_schedule[i].schedules;
                            session_schedule[0] = e.target.value.replace("T", " ") + ":00";

                            schedule.monthly_schedules[i] = {
                              ...schedule.monthly_schedules[i],
                              schedules: session_schedule,
                            }

                            // console.log(new_schedule);

                            setSchedule({
                              ...schedule,
                              monthly_schedules: new_schedule,
                            })
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm text-tec-darker font-semibold select-none" htmlFor="session2_datetime">SESSION 2</label>
                        <input
                          type="datetime-local"
                          name="session2_datetime"
                          id="session2_datetime"
                          className="w-full p-2.5 mb-4 border-2 border-slate-300 focus:outline-none hover:border-tec-light
                          focus:border-tec-light rounded-lg"
                          required
                          value={v.schedules[1]}
                          min={`${schedule.year}-01-01 00:00:00`}
                          max={`${schedule.year}-12-31 23:59:59`}
                          onChange={(e) => {
                            let new_schedule = schedule.monthly_schedules;
                            let session_schedule = new_schedule[i].schedules;
                            session_schedule[1] = e.target.value.replace("T", " ") + ":00";

                            schedule.monthly_schedules[i] = {
                              ...schedule.monthly_schedules[i],
                              schedules: session_schedule,
                            }

                            // console.log(new_schedule);

                            setSchedule({
                              ...schedule,
                              monthly_schedules: new_schedule,
                            })
                          }}
                        />
                      </div>
                    </div>
                  </>
                )
              }) }
            </>
          ) : (
            <textarea
              placeholder={jsonPlaceholder}
              className="resize-y min-h-60 w-full px-3 py-2 mb-2 border-2 border-slate-300
                focus:outline-none hover:border-tec-light focus:border-tec-light rounded-lg
                font-mono"
              name="json_text"
              id="json_text"
              value={scheduleJson}
              onChange={(e) => setScheduleJson(e.target.value)}
            />
          )}

          <button
            type="submit"
            className="bg-tec-darker hover:bg-tec-dark text-white py-2 px-5 font-bold
              rounded-lg flex items-center gap-2 mt-5 cursor-pointer"
          >
            Save Schedule
          </button>
        </form>
      </main>
      )}

      <Snackbar
        isOpen={openSnackbar}
        setOpen={setOpenSnackbar}
        duration={3000}
        text={snackbarMsg}
        className="bg-red-500 text-white"
        buttonClassName="hover:bg-red-300 hover:text-black"
      />
    </div>
  );
}

export default EditHomepage;