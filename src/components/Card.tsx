import React from "react";
import { twMerge } from "tailwind-merge";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: React.ReactNode;
  subtitle?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  headerRight?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  title,
  subtitle,
  header,
  footer,
  headerRight,
}) => {
  return (
    <div
      className={twMerge(
        "bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden",
        className
      )}
    >
      {(title || subtitle || header) && (
        <div className="px-6 py-4 border-b border-gray-100">
          {header || (
            <>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
              )}
            </>
          )}
          {headerRight && (
            <div className="flex justify-end items-center">{headerRight}</div>
          )}
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          {footer}
        </div>
      )}
    </div>
  );
};
