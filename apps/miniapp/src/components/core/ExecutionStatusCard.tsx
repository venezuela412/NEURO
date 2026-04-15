import { AlertTriangle, CheckCircle2, LoaderCircle, ShieldCheck, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { getExecutionPreview } from "@neuro/adapters";
import type { ExecutionStatus } from "@neuro/shared";

interface ExecutionStatusCardProps {
  status: ExecutionStatus;
}

const iconMap = {
  idle: ShieldCheck,
  preparing: LoaderCircle,
  "ready-to-sign": CheckCircle2,
  "waiting-for-wallet": Wallet,
  submitted: LoaderCircle,
  confirming: LoaderCircle,
  success: CheckCircle2,
  "retry-needed": AlertTriangle,
  "fallback-available": ShieldCheck,
  "failed-safely": AlertTriangle,
} satisfies Record<ExecutionStatus, typeof ShieldCheck>;

export function ExecutionStatusCard({ status }: ExecutionStatusCardProps) {
  const preview = getExecutionPreview(status);
  const Icon = iconMap[status];
  const spinning = status === "preparing" || status === "submitted" || status === "confirming";

  return (
    <motion.section
      className="card execution-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="inline-icon-row">
        <Icon size={18} className={spinning ? "spin" : undefined} />
        <span>{preview.title}</span>
      </div>
      <p className="muted">{preview.description}</p>
    </motion.section>
  );
}
