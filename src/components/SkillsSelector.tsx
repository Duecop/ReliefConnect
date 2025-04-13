import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Badge, X, Check, PlusCircle, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Database } from '../types/supabase';

type Skill = Database['public']['Tables']['skills']['Row'];

interface SkillsSelectorProps {
  selectedSkills: string[];
  onChange: (skills: string[]) => void;
  maxSkills?: number;
}

export default function SkillsSelector({ selectedSkills, onChange, maxSkills = 10 }: SkillsSelectorProps) {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [skillsByCategory, setSkillsByCategory] = useState<Record<string, Skill[]>>({});

  useEffect(() => {
    async function fetchSkills() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('skills')
          .select('*')
          .order('name');
        
        if (error) throw error;
        
        setSkills(data || []);
        
        // Group skills by category
        const groupedSkills: Record<string, Skill[]> = {};
        data?.forEach(skill => {
          if (!groupedSkills[skill.category]) {
            groupedSkills[skill.category] = [];
          }
          groupedSkills[skill.category].push(skill);
        });
        
        setSkillsByCategory(groupedSkills);
      } catch (error) {
        console.error('Error fetching skills:', error);
        toast.error('Failed to load skills');
      } finally {
        setLoading(false);
      }
    }
    
    fetchSkills();
  }, []);

  const toggleSkill = (skillName: string) => {
    if (selectedSkills.includes(skillName)) {
      onChange(selectedSkills.filter(s => s !== skillName));
    } else {
      if (selectedSkills.length >= maxSkills) {
        toast.error(`You can select a maximum of ${maxSkills} skills`);
        return;
      }
      onChange([...selectedSkills, skillName]);
    }
  };

  const removeSkill = (skillName: string) => {
    onChange(selectedSkills.filter(s => s !== skillName));
  };

  const filteredSkills = skills.filter(skill => 
    skill.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    skill.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (skill.description && skill.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
      
      {/* Selected skills display */}
      <div className="mb-2 flex flex-wrap gap-2">
        {selectedSkills.length === 0 ? (
          <span className="text-sm text-gray-500">No skills selected</span>
        ) : (
          selectedSkills.map(skill => (
            <div 
              key={skill}
              className="inline-flex items-center bg-primary-100 text-primary-800 rounded-full px-3 py-1 text-sm"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-2 text-primary-600 hover:text-primary-800"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))
        )}
      </div>
      
      <div className="relative">
        {/* Search input */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search or add skills..."
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setShowDropdown(true)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        </div>
        
        {/* Dropdown for selecting skills */}
        {showDropdown && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-96 overflow-y-auto border border-gray-200">
            <div className="p-2 flex justify-between text-sm text-gray-500 border-b">
              <span>Select skills (max {maxSkills})</span>
              <button 
                type="button" 
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowDropdown(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading skills...</p>
              </div>
            ) : filteredSkills.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">No skills found matching '{searchTerm}'</p>
              </div>
            ) : (
              <div>
                {Object.entries(skillsByCategory)
                  .filter(([_, categorySkills]) => 
                    categorySkills.some(skill => 
                      filteredSkills.some(fs => fs.id === skill.id)
                    )
                  )
                  .map(([category, _]) => (
                    <div key={category} className="px-1">
                      <div className="px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-50">
                        {category}
                      </div>
                      <div>
                        {skillsByCategory[category]
                          .filter(skill => filteredSkills.some(fs => fs.id === skill.id))
                          .map(skill => (
                            <button
                              key={skill.id}
                              type="button"
                              className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center justify-between ${
                                selectedSkills.includes(skill.name) ? 'bg-primary-50' : ''
                              }`}
                              onClick={() => toggleSkill(skill.name)}
                            >
                              <div>
                                <span className="font-medium">{skill.name}</span>
                                {skill.description && (
                                  <p className="text-xs text-gray-500">{skill.description}</p>
                                )}
                              </div>
                              {selectedSkills.includes(skill.name) ? (
                                <Check className="h-4 w-4 text-primary-600" />
                              ) : (
                                <PlusCircle className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          ))
                        }
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        )}
      </div>
      
      <p className="mt-1 text-xs text-gray-500">
        Select skills that represent your capabilities in disaster response.
      </p>
    </div>
  );
} 