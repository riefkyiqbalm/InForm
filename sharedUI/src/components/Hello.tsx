'use-client'
import { textStyles as T } from "@sharedUI/lib/styles/text";
import { useAuth } from "@sharedUI/context/SharedAuthContext";
import Logo from "./logo/BigLogo";

export default function Welcome() {
const { user } = useAuth();
  return (
    <>
    <div style={T.brand}>
        <Logo/>
        {/* <h1 style={T.h1}>InForm</h1> */}
        <h2 style={T.h2}>Halo, <span style={{ color: 'var(--teal)' }}>{(user?.name)?.toUpperCase()}</span></h2>
        <p style={T.p}>
          InForm siap membantu untuk proses administrasi dan perizinan
          MBG.
        </p>
    </div>
    </>
  );
}