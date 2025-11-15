import type { ReactNode } from "react";

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="bg-blue-light min-h-svh">
      <div className="pointer-events-none absolute inset-0 bg-[url(/images/texture.webp)] opacity-15" />
      {children}
    </div>
  );
};

export default Layout;
