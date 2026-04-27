'use-client'
import { textStyles as T } from "@sharedUI/lib/styles/text";
import BigLogo from "@sharedUI/components/logo/BigLogo";

export default function Welcome() {
  return (
    <>
    <div style={T.brand}>
        <BigLogo/>
        <h1 style={T.h1}>InForm</h1>
        <p style={T.p}>
          InForm siap membantu untuk proses Administrasi dan Pengisian Formulir
        </p>
    </div>
    </>
  );
}
