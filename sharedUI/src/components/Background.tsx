'use-client'
import { backgroundStyles as Sbg } from "../lib/styles/background";
export default function Background() {
    return (
        <div>
            <div style={Sbg.bgGrid} />
            <div style={Sbg.orb1} />
            <div style={Sbg.orb2} />
        </div>
    )
}