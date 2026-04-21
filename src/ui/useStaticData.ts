import { useEffect, useState } from "react";

export default function useStaticData() {
  const [data, setData] = useState<StaticData>();

  useEffect(() => {
    window.electron.getStaticData().then((res) => setData(res));
  }, []);

  return { data };
}
