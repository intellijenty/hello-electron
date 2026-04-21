import { useEffect, useState } from "react";

function useStatistics(maxLength: number): Statistics[] {
  const [value, setValue] = useState<Statistics[]>([]);

  useEffect(() => {
    const unSub = window.electron.subscribeStatistics((data) => {
      setValue((prev) => {
        const newValue = [...prev, data];
        if (newValue.length > maxLength) newValue.shift();
        return newValue;
      });
    });
    return unSub;
  }, [maxLength]);

  return value;
}

export default useStatistics;
