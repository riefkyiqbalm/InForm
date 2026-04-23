"use-client";
import { textStyles as T } from "@/lib/styles/text";
import BigLogo from "./logo/BigLogo";

export default function Welcome() {
  return (
    <>
    <div style={T.brand}>
        <BigLogo/>
        <h1 style={T.h1}>inForm</h1>
        <p style={T.p}>
          inForm siap membantu untuk proses administrasi dan perizinan
          MBG.
        </p>
    </div>
    </>
  );
}
