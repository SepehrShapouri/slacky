'use client'

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

export default function AnimatedLogo() {
  const duration = 5
  const colors = {
    bg: "#F3F4F6",
    circle: "#5e2c5f",
    lines: ["#0094c6", "#005e7c", "#e8ddb5", "#edafb8"]
  }

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.2,
        repeat: Infinity,
        repeatDelay: 1
      }
    }
  }

  const centerCircleVariants = {
    initial: { scale: 1, opacity: 1 },
    animate: {
      scale: [1, 0, 0, 0, 0, 1],
      opacity: [1, 0, 0, 0, 0, 1],
      transition: { duration, times: [0, 0.1, 0.4, 0.6, 0.9, 1], ease: "easeInOut", repeat: Infinity }
    }
  }

  const smallCircleVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: (i: number) => ({
      scale: [0, 1, 1, 1, 1, 0],
      opacity: [0, 1, 1, 1, 1, 0],
      x: [0, [-40, 40, -40, 40][i], [-40, 40, -40, 40][i], [-40, 40, -40, 40][i], 0, 0],
      y: [0, [-40, -40, 40, 40][i], [-40, -40, 40, 40][i], [-40, -40, 40, 40][i], 0, 0],
      transition: { duration, times: [0, 0.1, 0.4, 0.6, 0.9, 1], ease: "easeInOut", repeat: Infinity }
    })
  }

  const lineVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: (i: number) => ({
      pathLength: [0, 0, 1, 1, 0, 0],
      opacity: [0, 0, 1, 1, 0, 0],
      transition: { duration, times: [0, 0.2, 0.4, 0.6, 0.8, 1], ease: "easeInOut", repeat: Infinity }
    })
  }

  return (
    <div className="flex items-center justify-center ">
      <Card className="border-none shadow-none">
        <motion.svg
          width="140"
          height="140"
          viewBox="-120 -120 240 240"
          variants={containerVariants}
          initial="initial"
          animate="animate"
          className="w-full h-full"
        >
          <motion.circle
            cx="0"
            cy="0"
            r="60"
            fill={colors.circle}
            variants={centerCircleVariants}
          />

          {[0, 1, 2, 3].map((i) => (
            <motion.circle
              key={i}
              cx="0"
              cy="0"
              r="12"
              fill={colors.lines[i]}
              custom={i}
              variants={smallCircleVariants}
            />
          ))}

          <motion.line
            x1="-60"
            y1="-20"
            x2="60"
            y2="-20"
            stroke={colors.lines[0]}
            strokeWidth="12"
            strokeLinecap="round"
            variants={lineVariants}
            custom={0}
          />
          <motion.line
            x1="-60"
            y1="20"
            x2="60"
            y2="20"
            stroke={colors.lines[1]}
            strokeWidth="12"
            strokeLinecap="round"
            variants={lineVariants}
            custom={1}
          />
          <motion.line
            x1="-20"
            y1="-60"
            x2="-20"
            y2="60"
            stroke={colors.lines[2]}
            strokeWidth="12"
            strokeLinecap="round"
            variants={lineVariants}
            custom={2}
          />
          <motion.line
            x1="20"
            y1="-60"
            x2="20"
            y2="60"
            stroke={colors.lines[3]}
            strokeWidth="12"
            strokeLinecap="round"
            variants={lineVariants}
            custom={3}
          />
        </motion.svg>
      </Card>
    </div>
  )
}