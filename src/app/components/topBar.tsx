"use client";

import { TitleProps } from "../interfaces/types";

export default function TopBar(props: TitleProps) {
  return (
    <div className="fixed top-0 left-[288px] w-[calc(100vw-288px)] h-16 bg-blue-100 flex justify-center px-8 shadow">
      <div className="text-blue-900 text-2xl font-bold flex justify-center items-center">
        {props.title}
      </div>
    </div>
  );
}
