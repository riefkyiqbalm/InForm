import os
import base64

assets_dir = './src/assets'
output_file = './src/lib/constants/icon2.ts'

def generate_icon_ts():
    if not os.path.exists(assets_dir):
        print(f"❌ Folder '{assets_dir}' tidak ditemukan!")
        return

    # Ambil semua file berakhiran .svg
    svg_files = [f for f in os.listdir(assets_dir) if f.endswith('.svg')]

    if not svg_files:
        print("⚠️ Tidak ada file SVG ditemukan.")
        return

    ts_content = "export const ICONS = {\n"

    for file in svg_files:
        file_name = os.path.splitext(file)[0]
        file_path = os.path.join(assets_dir, file)

        # Baca file sebagai binary dan ubah ke base64
        with open(file_path, "rb") as f:
            encoded_string = base64.b64encode(f.read()).decode('utf-8')
            data_uri = f"data:image/svg+xml;base64,{encoded_string}"
            
            ts_content += f'  "{file_name}": "{data_uri}",\n'

    ts_content += "} as const;\n\n"
    ts_content += "export type IconType = keyof typeof ICONS;\n"

    # Tulis hasil ke dalam file icon.ts
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(ts_content)

    print(f"✅ Berhasil membuat file '{output_file}' dengan {len(svg_files)} icon!")

if __name__ == "__main__":
    generate_icon_ts()