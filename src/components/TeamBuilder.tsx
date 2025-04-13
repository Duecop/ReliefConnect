import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, UserPlus, X, Award, Search, AlertCircle, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Database } from '../types/supabase';

type Volunteer = Database['public']['Tables']['volunteers']['Row'] & {
  skills?: string[];
  skill_details?: Record<string, any>;
  experience_level?: string;
  email?: string;
};

type Skill = Database['public']['Tables']['skills']['Row'];

type Team = Database['public']['Tables']['teams']['Row'];

interface TeamBuilderProps {
  incidentId?: string;
  onTeamCreated?: (teamId: string) => void;
}

export default function TeamBuilder({ incidentId, onTeamCreated }: TeamBuilderProps) {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState<Volunteer[]>([]);
  const [selectedVolunteers, setSelectedVolunteers] = useState<Volunteer[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [leaderId, setLeaderId] = useState<string | null>(null);
  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState<string>('');

  // Load volunteers and skills data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch volunteers
        const { data: volunteersData, error: volunteersError } = await supabase
          .from('volunteers')
          .select('*');
        
        if (volunteersError) throw volunteersError;
        
        // Fetch skills
        const { data: skillsData, error: skillsError } = await supabase
          .from('skills')
          .select('*');
        
        if (skillsError) throw skillsError;
        
        setVolunteers(volunteersData || []);
        setFilteredVolunteers(volunteersData || []);
        setSkills(skillsData || []);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load volunteers and skills data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Filter volunteers based on search term and selected skill
  useEffect(() => {
    let results = volunteers;
    
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      results = results.filter(vol => 
        vol.name?.toLowerCase().includes(lowerSearch) || 
        vol.email?.toLowerCase().includes(lowerSearch)
      );
    }
    
    if (filterSkill) {
      results = results.filter(vol => 
        vol.skills?.includes(filterSkill)
      );
    }
    
    setFilteredVolunteers(results);
  }, [volunteers, searchTerm, filterSkill]);

  const handleSelectVolunteer = (volunteer: Volunteer) => {
    if (!selectedVolunteers.find(v => v.id === volunteer.id)) {
      setSelectedVolunteers([...selectedVolunteers, volunteer]);
    }
  };

  const handleRemoveVolunteer = (volunteerId: string) => {
    setSelectedVolunteers(selectedVolunteers.filter(v => v.id !== volunteerId));
    
    if (leaderId === volunteerId) {
      setLeaderId(null);
    }
  };

  const handleSetLeader = (volunteerId: string) => {
    setLeaderId(volunteerId);
  };

  const handleToggleSkill = (skillId: string) => {
    if (requiredSkills.includes(skillId)) {
      setRequiredSkills(requiredSkills.filter(id => id !== skillId));
    } else {
      setRequiredSkills([...requiredSkills, skillId]);
    }
  };

  const validateTeam = (): boolean => {
    if (!teamName.trim()) {
      toast.error('Team name is required');
      return false;
    }
    
    if (selectedVolunteers.length === 0) {
      toast.error('Please select at least one volunteer');
      return false;
    }
    
    if (!leaderId) {
      toast.error('Please designate a team leader');
      return false;
    }
    
    return true;
  };

  const handleCreateTeam = async () => {
    if (!validateTeam()) return;
    
    try {
      setSaving(true);
      
      // Create the team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert([{
          name: teamName,
          description: teamDescription,
          leader_id: leaderId,
          members: selectedVolunteers.map(v => v.id),
          skills_required: requiredSkills,
          active: true,
          incident_id: incidentId || null,
          location: location || null
        }])
        .select();
      
      if (teamError) throw teamError;
      
      if (teamData && teamData.length > 0) {
        toast.success('Team created successfully!');
        
        // Reset form
        setTeamName('');
        setTeamDescription('');
        setLeaderId(null);
        setSelectedVolunteers([]);
        setRequiredSkills([]);
        setLocation('');
        
        // Call callback if provided
        if (onTeamCreated) {
          onTeamCreated(teamData[0].id);
        }
      }
      
    } catch (error) {
      console.error('Error creating team:', error);
      toast.error('Failed to create team');
    } finally {
      setSaving(false);
    }
  };

  const getSkillName = (skillId: string): string => {
    const skill = skills.find(s => s.id === skillId);
    return skill?.name || 'Unknown Skill';
  };

  // Calculate team skill coverage
  const calculateSkillCoverage = (): { covered: string[], missing: string[] } => {
    const coveredSkills: string[] = [];
    const missingSkills: string[] = [];
    
    requiredSkills.forEach(skillId => {
      const isSkillCovered = selectedVolunteers.some(v => 
        v.skills?.includes(skillId)
      );
      
      if (isSkillCovered) {
        coveredSkills.push(skillId);
      } else {
        missingSkills.push(skillId);
      }
    });
    
    return { covered: coveredSkills, missing: missingSkills };
  };

  const renderVolunteerList = (volunteers: Volunteer[], isSelection = false) => {
    if (volunteers.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          {isSelection ? 'No volunteers selected' : 'No volunteers found'}
        </div>
      );
    }
    
    return volunteers.map(volunteer => (
      <div 
        key={volunteer.id} 
        className={`p-3 border rounded-md mb-2 ${
          isSelection 
            ? 'border-primary-200 bg-primary-50' 
            : 'border-gray-200 bg-white hover:bg-gray-50 cursor-pointer'
        }`}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
              volunteer.experience_level === 'expert' 
                ? 'bg-green-500' 
                : volunteer.experience_level === 'intermediate'
                  ? 'bg-blue-500'
                  : 'bg-gray-500'
            }`}>
              {volunteer.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="ml-2">
              <div className="font-medium text-gray-800">{volunteer.name}</div>
              <div className="text-xs text-gray-600">{volunteer.email}</div>
              {volunteer.skills && volunteer.skills.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-1">
                  {volunteer.skills.slice(0, 3).map(skillId => (
                    <span 
                      key={skillId} 
                      className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs"
                    >
                      {getSkillName(skillId)}
                    </span>
                  ))}
                  {volunteer.skills.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                      +{volunteer.skills.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {isSelection ? (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleSetLeader(volunteer.id)}
                className={`p-1 rounded-full ${
                  leaderId === volunteer.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
                title={leaderId === volunteer.id ? 'Team Leader' : 'Set as Team Leader'}
              >
                <Award className="h-4 w-4" />
              </button>
              
              <button
                type="button"
                onClick={() => handleRemoveVolunteer(volunteer.id)}
                className="p-1 rounded-full bg-red-100 text-red-500 hover:bg-red-200"
                title="Remove from team"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => handleSelectVolunteer(volunteer)}
              className="p-1 rounded-full bg-primary-100 text-primary-500 hover:bg-primary-200"
              title="Add to team"
              disabled={selectedVolunteers.some(v => v.id === volunteer.id)}
            >
              <UserPlus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const skillCoverage = calculateSkillCoverage();

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          <Users className="h-5 w-5 mr-2 text-primary-500" />
          Team Builder
        </h2>
        <p className="text-sm text-gray-600">
          Create balanced teams based on skills and experience
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left column - Team details and selected volunteers */}
        <div className="p-4 border-r border-gray-200">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Name
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter team name"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Describe the team's purpose"
              rows={2}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Deployment location"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Required Skills
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
              {skills.map(skill => (
                <div 
                  key={skill.id} 
                  className="flex items-center"
                >
                  <input
                    type="checkbox"
                    id={`skill-${skill.id}`}
                    checked={requiredSkills.includes(skill.id)}
                    onChange={() => handleToggleSkill(skill.id)}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label 
                    htmlFor={`skill-${skill.id}`}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {skill.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {requiredSkills.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Skill Coverage</h3>
              
              {skillCoverage.covered.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-gray-600 mb-1">Covered Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {skillCoverage.covered.map(skillId => (
                      <span 
                        key={skillId} 
                        className="px-2 py-0.5 bg-green-100 text-green-800 rounded-full text-xs flex items-center"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        {getSkillName(skillId)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {skillCoverage.missing.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Missing Skills:</p>
                  <div className="flex flex-wrap gap-1">
                    {skillCoverage.missing.map(skillId => (
                      <span 
                        key={skillId} 
                        className="px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xs flex items-center"
                      >
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {getSkillName(skillId)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Members ({selectedVolunteers.length})
            </label>
            <div className="border rounded-md overflow-y-auto" style={{ maxHeight: '250px' }}>
              {renderVolunteerList(selectedVolunteers, true)}
            </div>
          </div>
          
          <button
            type="button"
            disabled={saving}
            onClick={handleCreateTeam}
            className="w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            {saving ? 'Creating Team...' : 'Create Team'}
          </button>
        </div>
        
        {/* Right column - Available volunteers */}
        <div className="p-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Find Volunteers
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="Search by name or email"
              />
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Skill
            </label>
            <select
              value={filterSkill}
              onChange={(e) => setFilterSkill(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="">All Skills</option>
              {skills.map(skill => (
                <option key={skill.id} value={skill.id}>
                  {skill.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Available Volunteers ({filteredVolunteers.length})
            </label>
            <div className="border rounded-md overflow-y-auto" style={{ maxHeight: '350px' }}>
              {renderVolunteerList(filteredVolunteers)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 