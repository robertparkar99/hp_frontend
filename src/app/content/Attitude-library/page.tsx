"use client";

import { useEffect, useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type Skill = {
    id: number;
    proficiency_level: string | null;
};

type CardData = {
    id: number;
    classification_item: string; // title
    classification_category: string; // category
    classification_sub_category: string; // subCategory
};

export default function Index() {
    const [skills, setSkills] = useState<Skill[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
    const [cards, setCards] = useState<CardData[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(true);
    const [loadingCards, setLoadingCards] = useState(false);
    interface SessionData {
        url?: string;
        token?: string;
        sub_institute_id?: string;
        org_type?: string;
    }

    const [sessionData, setSessionData] = useState<SessionData>({});

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem('userData');
            if (userData) {
                const { APP_URL, token, sub_institute_id, org_type } = JSON.parse(userData);
                setSessionData({ url: APP_URL, token, sub_institute_id, org_type });
            }
        }
    }, []);

    // 1. Fetch dropdown proficiency levels
    useEffect(() => {
        if (!sessionData.sub_institute_id) return; // ✅ wait until we have it

        const fetchSkills = async () => {
            try {
                const res = await fetch(
                    `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[classification]=attitude&group_by=proficiency_level`,
                    { cache: "no-store" }
                );
                const data = await res.json();

                const filtered = data.filter(
                    (item: Skill) => item.proficiency_level !== null
                );

                setSkills(filtered);
            } catch (err) {
                console.error("Error fetching skills:", err);
            } finally {
                setLoadingOptions(false);
            }
        };

        fetchSkills();
    }, [sessionData.sub_institute_id]);

    // 2. Fetch cards when proficiency_level changes
    const fetchCards = async () => {
    setLoadingCards(true);
    try {
        const res = await fetch(
            `${sessionData.url}/table_data?table=s_skill_knowledge_ability&filters[sub_institute_id]=${sessionData.sub_institute_id}&filters[classification]=attitude&filters[proficiency_level]=${selectedLevel}&order_by[id]=desc&group_by=classification_item`,
            { cache: "no-store" }
        );

        const data = await res.json();

        // ✅ Ensure it's always an array
        const normalized = Array.isArray(data) ? data : data?.data || [];

        setCards(normalized);
    } catch (err) {
        console.error("Error fetching cards:", err);
        setCards([]); // fallback to empty array
    } finally {
        setLoadingCards(false);
    }
};

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Dropdown Filter */}
                <div className="flex justify-end">
                    <Select onValueChange={(value) => setSelectedLevel(value)}>
                        <SelectTrigger className="w-[220px] rounded-xl border-gray-300 shadow-md bg-white">
                            <SelectValue placeholder="Filter by Proficiency" />
                        </SelectTrigger>
                        <SelectContent>
                            {loadingOptions ? (
                                <SelectItem value="loading" disabled>
                                    Loading...
                                </SelectItem>
                            ) : (
                                skills.map((skill) => (
                                    <SelectItem
                                        key={skill.id}
                                        value={skill.proficiency_level as string}
                                    >
                                        {skill.proficiency_level}
                                    </SelectItem>
                                ))
                            )}
                        </SelectContent>
                    </Select>
                </div>

                {/* Cards Grid */}
                {loadingCards ? (
                    <p className="text-center text-gray-600">Loading cards...</p>
                ) : cards.length === 0 ? (
                    <p className="text-center text-gray-600">
                        {selectedLevel
                            ? `No cards found for proficiency level ${selectedLevel}.`
                            : "Please select a proficiency level."}
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {cards.map((card) => {
                            const index = card.id;
                            const row = Math.floor(index / 4);
                            const col = index % 4;
                            const isType1 = (row + col) % 2 === 0;
                            const borderRadius = isType1
                                ? "rounded-[60px_5px_60px_5px]"
                                : "rounded-[5px_60px_5px_60px]";

                            return (
                                <div
                                    key={card.id}
                                    className={`w-full h-[180px] bg-white border-2 border-[#C5DFFF] shadow-md shadow-black/20 p-5 flex flex-col ${borderRadius}`}
                                >
                                    {/* Title */}
                                    <h2
                                        className="text-[#1E3A8A] font-bold text-[18px] text-center mb-3 leading-normal border-b border-[#919191] pb-1 truncate"
                                        title={card.classification_item}
                                    >
                                        {card.classification_item}
                                    </h2>

                                    {/* Category */}
                                    <div className="text-[14px] mb-1 mt-2 leading-[1.125]">
                                        <span className="font-bold text-[#1E3A8A]">Category : </span>
                                        <span className="font-normal text-[#393939]">
                                            {card.classification_category}
                                        </span>
                                    </div>

                                    {/* Sub Category */}
                                    <div className="text-[14px] leading-[22px]">
                                        <span className="font-bold text-[#1E3A8A]">
                                            Sub Category :{" "}
                                        </span>
                                        <span className="font-normal text-[#393939]">
                                            {card.classification_sub_category}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
