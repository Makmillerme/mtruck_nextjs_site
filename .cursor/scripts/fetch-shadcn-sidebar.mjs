import fs from "node:fs";
import path from "node:path";

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} ${res.status}`);
  return res.json();
}

function adapt(content) {
  return content
    .replaceAll("@/registry/new-york/hooks/use-mobile", "@/hooks/use-mobile")
    .replaceAll("@/registry/new-york/lib/utils", "@/lib/utils")
    .replaceAll("@/registry/new-york/ui/", "@/components/ui/")
    .replaceAll('from "lucide-react"', 'from "react-icons/lu"')
    .replaceAll("PanelLeftIcon", "LuPanelLeft")
    .replaceAll("PanelLeft", "LuPanelLeft")
    .replaceAll("<LuPanelLeft />", '<LuPanelLeft className="size-4" />');
}

const items = ["sidebar", "tooltip", "use-mobile"];

for (const name of items) {
  const data = await fetchJson(
    `https://ui.shadcn.com/r/styles/new-york/${name}.json`
  );
  for (const file of data.files || []) {
    let target;
    if (file.path.startsWith("ui/")) {
      target = path.join("components", "ui", path.basename(file.path));
    } else if (file.path.startsWith("hooks/")) {
      target = path.join("hooks", path.basename(file.path));
    } else {
      target = file.target || file.path;
    }
    fs.mkdirSync(path.dirname(target), { recursive: true });
    if (fs.existsSync(target) && name !== "sidebar") {
      console.log("skip existing", target);
      continue;
    }
    const content = adapt(file.content);
    fs.writeFileSync(target, content, "utf8");
    console.log("wrote", target, content.length);
  }
}
