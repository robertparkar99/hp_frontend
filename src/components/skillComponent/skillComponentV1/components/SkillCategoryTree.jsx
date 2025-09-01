'use client';

import React, { useEffect, useState } from 'react';
import Icon from '../../../AppIcon';
import {Input} from '../../../../components/ui/input';

const API_URL =
  'https://hp.triz.co.in/skill_library?type=API&token=798|VOTSJFcrJ4kzWcaHLUEfjNxF240rT6RgJ8WbnxeFfd11d2e2&sub_institute_id=1&org_type=Financial%20Services';

const SkillCategoryTree = ({ onCategorySelect, selectedCategory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState([]);
  const [skillCategories, setSkillCategories] = useState([]);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const res = await fetch(API_URL);
        const json = await res.json();
        const rawData = json?.allSkillData || {};

        const processed = Object.entries(rawData).map(([categoryName, subcategories]) => {
          let totalSkills = 0;
          const subcategoryList = Object.entries(subcategories).map(([subName, skills]) => {
            const count = skills.length;
            totalSkills += count;
            return {
              id: `${categoryName}-${subName}`.toLowerCase().replace(/\s+/g, '-'),
              name: subName,
              skillCount: count,
            };
          });

          return {
            id: categoryName.toLowerCase().replace(/\s+/g, '-'),
            name: categoryName,
            icon: 'Folder',
            skillCount: totalSkills,
            subcategories: subcategoryList,
          };
        });

        setSkillCategories(processed);
        setExpandedCategories(processed.map((c) => c.id)); // auto expand all
      } catch (error) {
        console.error('❌ Failed to fetch skill data:', error);
      }
    };

    fetchSkills();
  }, []);

  const filteredCategories = skillCategories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.subcategories.some((sub) =>
      sub.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const toggleCategory = (categoryId) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleCategoryClick = (id) => {
    onCategorySelect(id);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 h-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground mb-3">Skill Categories</h3>
        <Input
          type="search"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4"
        />
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredCategories.map((category) => (
          <div key={category.id} className="space-y-1">
            <div
              className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-smooth hover:bg-muted ${
                selectedCategory === category.id ? 'bg-primary/10 text-primary' : 'text-foreground'
              }`}
              onClick={() => handleCategoryClick(category.id)}
            >
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCategory(category.id);
                  }}
                  className="p-1 hover:bg-muted rounded"
                >
                  <Icon
                    name={expandedCategories.includes(category.id) ? 'ChevronDown' : 'ChevronRight'}
                    size={16}
                  />
                </button>
                <Icon name={category.icon} size={16} />
                <span className="text-sm font-medium">{category.name}</span>
              </div>
              <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                {category.skillCount}
              </span>
            </div>

            {expandedCategories.includes(category.id) && (
              <div className="ml-6 space-y-1">
                {category.subcategories.map((sub) => (
                  <div
                    key={sub.id}
                    className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-smooth hover:bg-muted ${
                      selectedCategory === sub.id
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground'
                    }`}
                    onClick={() => handleCategoryClick(sub.id)}
                  >
                    <span className="text-sm">{sub.name}</span>
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">
                      {sub.skillCount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-border">
        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between mb-1">
            <span>Total Skills:</span>
            <span className="font-medium">
              {skillCategories.reduce((acc, c) => acc + c.skillCount, 0)}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Categories:</span>
            <span className="font-medium">{skillCategories.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkillCategoryTree;
