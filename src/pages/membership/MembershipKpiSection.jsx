import React from "react";
import {
  UserOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
  UsergroupDeleteOutlined,
  DollarOutlined,
  GiftOutlined,
  BookOutlined,
} from "@ant-design/icons";
import MembershipKpiPillCard from "./MembershipKpiPillCard";

function buildKpiTiles(data) {
  const d = data || {};
  const net = (joinKey, leaveKey) =>
    (Number(d[joinKey]) || 0) - (Number(d[leaveKey]) || 0);

  return [
    {
      id: "totalActive",
      title: "Total Active",
      icon: UserOutlined,
      color: "#3f8600",
      iconBg: "rgba(63, 134, 0, 0.12)",
      backupType: "Total Active Members",
      value: d.totalActive,
      ytdCurrent: d.totalActiveYTD,
      ytdPrior: d.totalActiveLY,
      monthCurrent: d.totalActiveThisMonth,
      monthPrior: d.totalActiveLastMonth,
    },
    {
      id: "newJoiners",
      title: "New Joiners",
      icon: UsergroupAddOutlined,
      color: "#1890ff",
      iconBg: "rgba(24, 144, 255, 0.12)",
      backupType: "New Joiners",
      value: d.newJoiners,
      ytdCurrent: d.newJoinersYTD,
      ytdPrior: d.newJoinersLY,
      monthCurrent: d.newJoinersThisMonth,
      monthPrior: d.newJoinersLastMonth,
    },
    {
      id: "leavers",
      title: "Leavers",
      icon: UsergroupDeleteOutlined,
      color: "#cf1322",
      iconBg: "rgba(207, 19, 34, 0.12)",
      backupType: "Leavers",
      invertDelta: true,
      value: d.leavers,
      ytdCurrent: d.leaversYTD,
      ytdPrior: d.leaversLY,
      monthCurrent: d.leaversThisMonth,
      monthPrior: d.leaversLastMonth,
    },
    {
      id: "netGrowth",
      title: "Net Growth",
      icon: TeamOutlined,
      color: "#722ed1",
      iconBg: "rgba(114, 46, 209, 0.12)",
      backupType: "Net Growth",
      value: net("newJoiners", "leavers"),
      ytdCurrent: net("newJoinersYTD", "leaversYTD"),
      ytdPrior: net("newJoinersLY", "leaversLY"),
      monthCurrent: net("newJoinersThisMonth", "leaversThisMonth"),
      monthPrior: net("newJoinersLastMonth", "leaversLastMonth"),
    },
    {
      id: "paid",
      title: "Paid",
      icon: DollarOutlined,
      color: "#3f8600",
      iconBg: "rgba(63, 134, 0, 0.12)",
      backupType: "Paid Members",
      value: d.paidMembers,
      ytdCurrent: d.paidMembersYTD,
      ytdPrior: d.paidMembersLY,
      monthCurrent: d.paidMembersThisMonth,
      monthPrior: d.paidMembersLastMonth,
    },
    {
      id: "honorary",
      title: "Honorary",
      icon: GiftOutlined,
      color: "#1890ff",
      iconBg: "rgba(24, 144, 255, 0.12)",
      backupType: "Honorary Members",
      value: d.honoraryMembers,
      ytdCurrent: d.honoraryMembersYTD,
      ytdPrior: d.honoraryMembersLY,
      monthCurrent: d.honoraryMembersThisMonth,
      monthPrior: d.honoraryMembersLastMonth,
    },
    {
      id: "student",
      title: "Student",
      icon: BookOutlined,
      color: "#722ed1",
      iconBg: "rgba(114, 46, 209, 0.12)",
      backupType: "Student Members",
      value: d.studentMembers,
      ytdCurrent: d.studentMembersYTD,
      ytdPrior: d.studentMembersLY,
      monthCurrent: d.studentMembersThisMonth,
      monthPrior: d.studentMembersLastMonth,
    },
  ];
}

export default function MembershipKpiSection({ data, onBackupClick }) {
  const tiles = buildKpiTiles(data);

  return (
    <section className="membership-dashboard-kpi-section">
      <div className="membership-dashboard-kpi-section__head">
        <h2 className="membership-dashboard-kpi-section__title">
          Membership overview
        </h2>
        {data?.asOfDate ? (
          <span className="membership-dashboard-as-of">
            As of {data.asOfDate}
          </span>
        ) : null}
      </div>
      <div className="membership-kpi-pill-grid">
        {tiles.map((tile) => (
          <MembershipKpiPillCard
            key={tile.id}
            title={tile.title}
            icon={tile.icon}
            color={tile.color}
            iconBg={tile.iconBg}
            value={tile.value}
            ytdCurrent={tile.ytdCurrent}
            ytdPrior={tile.ytdPrior}
            monthCurrent={tile.monthCurrent}
            monthPrior={tile.monthPrior}
            invertDelta={tile.invertDelta}
            onValueClick={() => onBackupClick(tile.backupType)}
          />
        ))}
      </div>
    </section>
  );
}
