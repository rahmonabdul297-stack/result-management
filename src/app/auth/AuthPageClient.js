"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LuEye, LuEyeClosed } from "react-icons/lu";
import Schoolname from "../schoolname";
import Logo from "../logo";
import { toast } from "sonner";

export default function AuthPageClient() {
  const [logTyp, setLogTyp] = useState([
    { id: 1, icon: " 👨‍🏫", typ: "teacher" },
    { id: 2, icon: " ⚙️", typ: "admin" },
  ]);

  const route = useRouter();
  const [err, setErr] = useState("");
  const [showpass, setshowpass] = useState(false);
  const [tchPass, setTchPass] = useState("");
  const [tchID, setTchID] = useState("");
  const [AdminPass, setAdminPass] = useState("");
  const [AdminID, setAdminID] = useState("");
  const [seletTyp, setseletTyp] = useState(1);

  const handleTchLogin = () => {
    if (!tchID || !tchPass) {
      setErr("Fields are required!");
      return;
    }
    const teachers = {
      TCH001: { pass: "CT12026", route: "/dashboard/classone" },
      TCH002: { pass: "CT22026", route: "/dashboard/classtwo" },
      TCH003: { pass: "CT32026", route: "/dashboard/classthree" },
      TCH004: { pass: "CT42026", route: "/dashboard/classfour" },
      TCH005: { pass: "CT52026", route: "/dashboard/classfive" },
      TCH006: { pass: "CT62026", route: "/dashboard/classsix" },
    };
    const record = teachers[tchID];
    if (record && record.pass === tchPass) {
      setErr("");
      route.push(record.route);
    } else {
      const msg = "Invalid credentials. Please try again.";
      setErr(msg);
      toast.error(msg);
    }
  };

  const handleAdminLogin = () => {
    if (!AdminPass || !AdminID) {
      const msg = "Fields are required!";
      setErr(msg);
      toast.error(msg);
      return;
    }
    if (AdminID === "ADMIN" && AdminPass === "admin2026") {
      setErr("");
      route.push("/admin");
    } else {
      const msg = "Invalid credentials. Please try again.";
      setErr(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="h-screen w-full authBg">
      <div className="login-card">
        <div className="flex flex-col items-center py-3">
          <div className="h-24 w-[100px]">
            <Logo />
          </div>
          <div className="text-black">
            <Schoolname />
          </div>
          <span className="text-sm text-AppGray">{"location"}</span>
        </div>
        <div className="login-tabs">
          {logTyp.map((item) => (
            <div
              className={`bg-AppWhite text-AppBlack text-[13px] rounded-md px-6 w-[50%] py-2 ${seletTyp === item.id ? "bg-white" : ""} flex items-center justify-center gap-2 uppercase`}
              key={item.id}
              onClick={() => setseletTyp(item.id)}
            >
              {item.icon}
              {item.typ}
            </div>
          ))}
        </div>
        <div className="fg">
          <label>{seletTyp === 1 ? "Staff ID" : "Admin ID"}</label>
          <input
            type="text"
            id="l-user"
            placeholder={
              seletTyp === 1 ? "Enter your staff ID" : "Enter Your Admin ID"
            }
            onChange={(e) =>
              seletTyp === 1
                ? setTchID(e.target.value)
                : setAdminID(e.target.value)
            }
          />
        </div>
        <div className="fg">
          <label>Password</label>
          <div className="flex items-center gap-2">
            <input
              type={showpass ? "text" : "password"}
              id="l-pass"
              placeholder="Enter your password"
              className="w-[80%]"
              onChange={(e) =>
                seletTyp === 1
                  ? setTchPass(e.target.value)
                  : setAdminPass(e.target.value)
              }
            />
            <div onClick={() => setshowpass((prev) => !prev)}>
              {showpass ? <LuEye /> : <LuEyeClosed />}
            </div>
          </div>
        </div>
        <button
          className="btn-primary"
          onClick={seletTyp === 1 ? handleTchLogin : handleAdminLogin}
        >
          Sign In
        </button>
        <p className="text-red-500 text-center" id="l-err">
          {err}
        </p>
        <p className="text-[8px] py-4 text-center">
          Contact admin to reset your password · v3.0
        </p>
      </div>
    </div>
  );
}
