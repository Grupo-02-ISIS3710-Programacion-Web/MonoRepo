"use client";

import { ReactNode, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

type RouteTransitionProps = Readonly<{
    children: ReactNode;
}>;

export default function RouteTransition({ children }: RouteTransitionProps) {
    const pathname = usePathname();
    const isFirstRender = useRef(true);

    useEffect(() => {
        isFirstRender.current = false;
    }, []);

    return (
        <motion.div
            key={pathname}
            initial={isFirstRender.current ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
}
