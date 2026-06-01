import React, { useState } from "react";
import { Collapse } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";

export default function ExecutiveDashboardSection({
  sectionKey,
  title,
  subtitle,
  labelHint = null,
  children,
  defaultOpen = true,
  printPageBreak = true,
}) {
  const [activeKey, setActiveKey] = useState(defaultOpen ? [sectionKey] : []);

  return (
    <section
      className={`exec-dashboard-section${
        printPageBreak ? " exec-dashboard-section--print-page" : ""
      }`}
      data-section={sectionKey}
      aria-labelledby={`exec-section-heading-${sectionKey}`}
    >
      <Collapse
        bordered={false}
        destroyInactivePanel={false}
        activeKey={activeKey}
        onChange={(keys) => {
          const next = Array.isArray(keys) ? keys : keys ? [keys] : [];
          setActiveKey(next);
        }}
        expandIcon={({ isActive }) => (
          <CaretRightOutlined rotate={isActive ? 90 : 0} />
        )}
        className="exec-dashboard-section__collapse"
        items={[
          {
            key: sectionKey,
            label: (
              <div className="exec-dashboard-section__label">
                <h2
                  id={`exec-section-heading-${sectionKey}`}
                  className="exec-dashboard-section__title"
                >
                  {title}
                </h2>
                {subtitle || labelHint ? (
                  <div className="exec-dashboard-section__meta">
                    {subtitle ? (
                      <p className="exec-dashboard-section__subtitle">
                        {subtitle}
                      </p>
                    ) : null}
                    {labelHint}
                  </div>
                ) : null}
              </div>
            ),
            children: (
              <div className="exec-dashboard-section__content">{children}</div>
            ),
          },
        ]}
      />
    </section>
  );
}
