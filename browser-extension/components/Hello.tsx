import { textStyles as T } from "~lib/styles/text";
import { useAuth } from "~features/AuthContext";
import BigLogo from "@inform/ui/components/logo/BigLogo";

export default function Welcome() {
const { user } = useAuth();
  return (
    <>
    <div style={T.brand}>
        <BigLogo/>
        {/* <h1 style={T.h1}>BG-AI</h1> */}
        <h2 style={T.h2}>Halo, <span style={{ color: 'var(--teal)' }}>{(user?.name)?.toUpperCase()}</span></h2>
        <p style={T.p}>
          inForm siap membantu untuk proses administrasi dan perizinan
          MBG.
        </p>
    </div>
    </>
  );
}