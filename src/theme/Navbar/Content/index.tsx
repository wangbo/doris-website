import React, { useState, useEffect, type ReactNode } from 'react';
import { ErrorCauseBoundary } from '@docusaurus/theme-common';
import { useNavbarMobileSidebar } from '@docusaurus/theme-common/internal';
import NavbarItem, { type Props as NavbarItemConfig } from '@theme/NavbarItem';
import NavbarColorModeToggle from '@theme/Navbar/ColorModeToggle';
import NavbarMobileSidebarToggle from '@theme/Navbar/MobileSidebar/Toggle';
import { useLocation } from '@docusaurus/router';
import Link from '@docusaurus/Link';
import Translate from '@docusaurus/Translate';
import { NavbarDocsLeft, NavbarDocsRight, NavbarDocsBottom } from './components/NavbarDocs';
import { NavbarCommunityLeft, NavbarCommunityBottom, NavbarCommunityRight } from './components/NavbarCommunity';
import { NavbarCommonLeft, NavbarCommonRight } from './components/NavbarCommon';

import styles from './styles.module.css';

enum NavBar {
    DOCS = 'docs',
    COMMUNITY = 'community',
    COMMON = 'common',
}

export function getNavItem(items: NavbarItemConfig[], type: string) {
    return items.find(item => item.type === type);
}

export function NavbarItems({ items, isDocsPage }: { items: NavbarItemConfig[]; isDocsPage?: boolean }): JSX.Element {
    return (
        <>
            {items.map((item, i) => (
                <ErrorCauseBoundary
                    key={i}
                    onError={error =>
                        new Error(
                            `A theme navbar item failed to render.
Please double-check the following navbar item (themeConfig.navbar.items) of your Docusaurus config:
${JSON.stringify(item, null, 2)}`,
                            { cause: error },
                        )
                    }
                >
                    <NavbarItem {...item} />
                </ErrorCauseBoundary>
            ))}
        </>
    );
}

function NavbarContentLayout({
    left,
    right,
    bottom,
    isDocsPage = false,
}: {
    left: ReactNode;
    right: ReactNode;
    bottom: ReactNode;
    isDocsPage: boolean;
}) {
    const [isEN, setIsEN] = useState(true);
    useEffect(() => {
        if (typeof window !== 'undefined') {
            location.pathname.includes('zh-CN') ? setIsEN(false) : setIsEN(true);
        }
    }, [typeof window !== 'undefined' && location.pathname]);
    return (
        <>
            <div className="navbar__inner">
                <div className="navbar__items">{left}</div>
                <div className="navbar__items navbar__items--right">{right}</div>
            </div>
            <div className="navbar__bottom">{bottom}</div>
        </>
    );
}

export default function NavbarContent(): JSX.Element {
    const [currentNavbar, setCurrentNavbar] = useState(NavBar.DOCS);
    const mobileSidebar = useNavbarMobileSidebar();
    const location = useLocation();
    const [isEN, setIsEN] = useState(true);
    const [star, setStar] = useState<string>();

    async function getGithubStar() {
        try {
            const res = await fetch('https://api.github.com/repos/apache/doris');
            const data = await res.json();
            if (data && data.stargazers_count) {
                const starStr = (+parseFloat(formatStar(data.stargazers_count)).toFixed(1)).toString();
                setStar(starStr);
            }
        } catch (err) {
            console.error(err);
        }
    }

    function formatStar(star) {
        return String(star)
            .split('')
            .reverse()
            .reduce((prev, next, index) => {
                return (index % 3 ? next : next + '.') + prev;
            });
    }

    const NavbarTypes = {
        [NavBar.DOCS]: {
            left: <NavbarDocsLeft isEN={isEN} />,
            right: <NavbarDocsRight isEN={isEN} />,
            bottom: <NavbarDocsBottom isEN={isEN} />,
        },
        [NavBar.COMMUNITY]: {
            left: <NavbarCommunityLeft />,
            right: <NavbarCommunityRight />,
            bottom: <NavbarCommunityBottom />,
        },
        [NavBar.COMMON]: {
            left: <NavbarCommonLeft />,
            right: <NavbarCommonRight star={star} />,
            bottom: null,
        },
    };
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const pathname = location.pathname.split('/')[1];
            location.pathname.includes('zh-CN') ? setIsEN(false) : setIsEN(true);
            if (location.pathname.includes(NavBar.DOCS)) {
                setCurrentNavbar(NavBar.DOCS);
            } else if (pathname === NavBar.COMMUNITY || location.pathname.includes('zh-CN/community')) {
                setCurrentNavbar(NavBar.COMMUNITY);
            } else {
                setCurrentNavbar(NavBar.COMMON);
            }
        }
    }, [typeof window !== 'undefined' && location.pathname]);

    useEffect(() => {
        getGithubStar();
    }, []);

    return (
        <NavbarContentLayout
            left={NavbarTypes[currentNavbar].left}
            isDocsPage={currentNavbar === NavBar.DOCS}
            right={
                <>
                    {!mobileSidebar.disabled && <NavbarMobileSidebarToggle />}
                    {NavbarTypes[currentNavbar].right}
                    <NavbarColorModeToggle className={styles.colorModeToggle} />
                    <Link className="header-right-button-primary navbar-download-desktop" to="/download">
                        <Translate id="navbar.download">
                            {typeof window !== 'undefined' && location.pathname.includes('zh-CN/docs')
                                ? '下载'
                                : 'Download'}
                        </Translate>
                    </Link>
                </>
            }
            bottom={NavbarTypes[currentNavbar].bottom}
        />
    );
}
