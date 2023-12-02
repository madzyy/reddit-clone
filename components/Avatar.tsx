
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

type Props={
  seed?: string
  large?:boolean
}

function Avatar({seed, large}: Props) {
  const { data: session } = useSession();
  const [svgContent, setSvgContent] = useState("");

  useEffect(() => {
    const fetchSvg = async () => {
      try {
        const response = await fetch(
          `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed || session?.user?.name || "placeholder"}`
        );
        const svgData = await response.text();
        setSvgContent(svgData);
      } catch (error) {
        console.error("Error fetching SVG:", error);
      }
    };

    fetchSvg();
  }, [session?.user?.name]);

  return (
    <div className={`relative h-10 w-10 rounded-full border border-gray-300 bg-white overflow-hidden ${large && "h-20 w-20"}`}>
      {svgContent && (
        <div dangerouslySetInnerHTML={{ __html: svgContent }} />
      )}
    </div>
  );
}

export default Avatar;



