import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Shield, Coins, HelpCircle, Wallet, BarChart3, Lock } from "lucide-react";

const FAQ_ITEMS = [
  {
    icon: HelpCircle,
    question: "What is NeuroTON?",
    answer: "NeuroTON is a simple way to earn more TON cryptocurrency. You deposit your TON, choose a goal, and our automated system puts your money to work — earning rewards while you do nothing.",
  },
  {
    icon: Shield,
    question: "Is my money safe?",
    answer: "Yes. Your funds are secured by a Smart Contract on the TON blockchain. This is code that runs automatically — no person can access or withdraw your money. Only you can control your funds with your wallet.",
  },
  {
    icon: Coins,
    question: "How do I earn?",
    answer: "When you deposit TON, our system automatically stakes it (like putting it in a savings account), farms yields across trusted DeFi protocols, and compounds the earnings. You can choose from safe low-risk options to higher-return strategies.",
  },
  {
    icon: BarChart3,
    question: "What return can I expect?",
    answer: "Returns depend on your chosen strategy. Safe staking earns around 7–19% per year. Bolder strategies can earn 25–80% per year, but come with higher risk. All estimates are shown before you commit.",
  },
  {
    icon: Wallet,
    question: "How do I get started?",
    answer: "1. Connect your TON wallet (like Tonkeeper or MyTonWallet)\n2. Choose an earning strategy that matches your comfort level\n3. Approve the deposit transaction in your wallet\n4. That's it — your TON starts working immediately!",
  },
  {
    icon: Lock,
    question: "Can I withdraw anytime?",
    answer: "Yes. You can withdraw your funds at any time. There are no lock-up periods for basic staking. Some advanced strategies may take a few minutes to process withdrawals as positions are unwound.",
  },
  {
    icon: HelpCircle,
    question: "What's the minimum deposit?",
    answer: "The minimum deposit is 3 TON. This covers the smart contract interaction fees and ensures your position can generate meaningful returns.",
  },
  {
    icon: Shield,
    question: "Who controls my funds?",
    answer: "Only you. NeuroTON uses a non-custodial Smart Contract — meaning the code on the blockchain holds and manages your funds. Our system can only compound earnings and optimize strategies, never withdraw your principal.",
  },
];

function FAQItem({ item, isOpen, onToggle }: {
  item: typeof FAQ_ITEMS[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  const Icon = item.icon;
  return (
    <motion.div
      className="faq-item"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <button className="faq-question" onClick={onToggle} type="button">
        <div className="faq-question-left">
          <div className="faq-icon-wrap">
            <Icon size={16} />
          </div>
          <span>{item.question}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className="faq-chevron" />
        </motion.div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="faq-answer-wrap"
          >
            <p className="faq-answer">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function FAQScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="faq-screen">
      <div className="faq-header">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <p className="faq-subtitle">
          Everything you need to know about earning with NeuroTON. Can't find your answer? Reach out on Telegram.
        </p>
      </div>

      <div className="faq-list">
        {FAQ_ITEMS.map((item, idx) => (
          <FAQItem
            key={idx}
            item={item}
            isOpen={openIndex === idx}
            onToggle={() => setOpenIndex(openIndex === idx ? null : idx)}
          />
        ))}
      </div>

      <div className="faq-contact">
        <p className="faq-contact-text">Still have questions?</p>
        <a
          href="https://t.me/neuroton_support"
          target="_blank"
          rel="noreferrer"
          className="faq-contact-link"
        >
          Chat with us on Telegram →
        </a>
      </div>
    </div>
  );
}
