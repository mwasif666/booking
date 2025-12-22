// src/CardsMap.jsx
import React from "react";
import ScrollStack, { ScrollStackItem } from "./ScrollCards";

const CardsMap = () => {
  return (
    <div style={{ background: "white", color: "black", minHeight: "100vh" }}>
      {/* Main heading – extra large & centered */}
      <h1
        style={{
          paddingTop: "2rem",
          margin: 0,
          textAlign: "center",
          fontSize: "3.5rem",
          fontWeight: 800,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        ESG Impact Journey
      </h1>

      <ScrollStack
        useWindowScroll={false}
        itemDistance={120}
        itemScale={0.04}
        itemStackDistance={40}
        baseScale={0.8}
        blurAmount={1}
        rotationAmount={-1} // last card will stay straight because logic me handle kar diya hai
        onStackComplete={() => console.log("Stack completed")}
      >
        {/* CARD 1 */}
        <ScrollStackItem>
          <div className="row">
            <div className="col-lg-1">
              <h1
                style={{
                  margin: 0,
                  textAlign: "start",
                  fontSize: "10rem",
                  fontWeight: 100,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  opacity: "0.1",
                }}
              >
                01
              </h1>
            </div>
            <div className="col-lg-6">
              <h2
                style={{
                  margin: 0,
                  textAlign: "start",
                  fontSize: "5rem",
                  fontWeight: 800,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  lineHeight: "1",
                }}
              >
                Kick-Off <br /> &amp; Big Picture
              </h2>
            </div>
            <div className="col-lg-5">
              <p>
                <strong>Purpose:</strong> Show the benefits of ESG and identify
                gaps.
              </p>
              <p>
                <strong>Approach:</strong> Kick-off with management to align
                expectations, outline ESG benefits, and conduct a light status
                assessment.
              </p>
              <p>
                <strong>Outcome:</strong> Clear overview of your current
                position and gap analysis using a traffic-light system.
              </p>
            </div>
          </div>
        </ScrollStackItem>

        {/* CARD 2 */}
        <ScrollStackItem>
          <h2>Training &amp; Enablement</h2>

          <p>
            <strong>Purpose:</strong> Build internal capability to handle ESG
            data.
          </p>
          <p>
            <strong>Approach:</strong> Standardised workshops on Environmental,
            Social and Governance practices.
          </p>
          <p>
            <strong>Outcome:</strong> Reliable and consistent ESG data processes
            across all departments.
          </p>
        </ScrollStackItem>

        {/* CARD 3 */}
        <ScrollStackItem>
          <h2>Footprint Analysis</h2>

          <p>
            <strong>Purpose:</strong> Provide hard numbers on emissions (Scope
            1, 2, and optional 3/PCF).
          </p>
          <p>
            <strong>Approach:</strong> Data-driven footprint analysis using
            standardised methodologies.
          </p>
          <p>
            <strong>Outcome:</strong> A verified emissions baseline enabling
            Net-Zero strategy and external reporting.
          </p>
        </ScrollStackItem>

        {/* CARD 4 */}
        <ScrollStackItem>
          <h2>ESG Strategy &amp; Roadmap</h2>

          <p>
            <strong>Purpose:</strong> Turn ESG into a structured and measurable
            part of corporate planning.
          </p>
          <p>
            <strong>Approach:</strong> Tailored strategy development across E
            (road to Net Zero), S, and G, aligned with business objectives and
            clear KPIs.
          </p>
          <p>
            <strong>Outcome:</strong> Defined goals, actionable measures, and a
            roadmap with regular reviews.
          </p>
        </ScrollStackItem>

        {/* CARD 5 */}
        <ScrollStackItem>
          <h2>Impact Communication</h2>

          <p>
            <strong>Purpose:</strong> Translate ESG progress into stakeholder
            value.
          </p>
          <p>
            <strong>Approach:</strong> Support in reporting and positioning with
            investors, banks, and customers.
          </p>
          <p>
            <strong>Outcome:</strong> Increased trust, financing advantages, and
            competitive edge.
          </p>
        </ScrollStackItem>

        {/* CARD 6 */}
        <ScrollStackItem>
          <h2>Annual ESG Audit</h2>

          <p>
            <strong>Purpose:</strong> Provide independent verification of ESG
            progress and achievement.
          </p>
          <p>
            <strong>Approach:</strong> Annual review of your roadmap, KPIs, and
            investor-required metrics.
          </p>
          <p>
            <strong>Outcome:</strong> Objective validation and continuous
            improvement opportunities.
          </p>
        </ScrollStackItem>
      </ScrollStack>
    </div>
  );
};

export default CardsMap;
