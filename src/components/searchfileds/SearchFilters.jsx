// SearchFilters.jsx
import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import Select from '../ui/Select';

// read session data from localStorage
const getSessionData = () => {
  try {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const {
          APP_URL,
          token,
          org_type,
          sub_institute_id,
          user_id,
          user_profile_name
        } = JSON.parse(userData);
        return { url: APP_URL, token, org_type, sub_institute_id, user_id, user_profile_name };
      }
    }
    return null;
  } catch (error) {
    console.error('Error parsing session data:', error);
    return null;
  }
};

const SearchFilters = ({
  formData = {},
  onFormChange = () => {},
  onSearch = () => {},
  showAdditionalFields = false,
  showSearchButton = true
}) => {
  const defaults = {
    searchSection: '',
    searchStandard: '',
    subject: '',
    searchByChapter: [],
    searchByTopic: '',
    searchByMappingType: '',
    searchByMappingValue: ''
  };
  const mergedForm = { ...defaults, ...formData };

  const [sections, setSections] = useState([{ label: 'Select Section', value: '' }]);
  const [standards, setStandards] = useState([{ label: 'Select Department', value: '' }]);
  const [subjects, setSubjects] = useState([{ label: 'Select Course', value: '' }]);
  const [chapters, setChapters] = useState([{ label: 'Select Chapter', value: '' }]);

  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingStandards, setLoadingStandards] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingChapters, setLoadingChapters] = useState(false);

  const handleChange = (field, value) => {
    // if multiple, value may already be an array from <Select>
    onFormChange(field, value);
  };

  // 1️⃣ Fetch sections
  useEffect(() => {
    let cancelled = false;
    const fetchSections = async () => {
      setLoadingSections(true);
      try {
        const sessionData = getSessionData();
        if (!sessionData) {
          console.warn('Session data not found.');
          setSections([{ label: 'Search Section', value: '' }]);
          return;
        }
        const base = sessionData.url?.replace(/\/$/, '') ?? '';
        const apiUrl = `${base}/table_data?table=academic_section&filters[sub_institute_id]=${encodeURIComponent(sessionData.sub_institute_id)}`;
        const res = await fetch(apiUrl, {
          headers: sessionData.token ? { Authorization: `Bearer ${sessionData.token}` } : {}
        });

        if (!res.ok) {
          console.error('Sections fetch failed', res.status, await res.text());
          setSections([{ label: 'Search Section', value: '' }]);
          return;
        }

        const data = await res.json();
        if (cancelled) return;

        const arr = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        const formatted = [{ label: 'Search Industry', value: '' }, ...arr.map(item => ({
          label: item.title || item.name ,
          value: item.id
        }))];
        setSections(formatted);
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching sections:', err);
          setSections([{ label: 'Search Section', value: '' }]);
        }
      } finally {
        if (!cancelled) setLoadingSections(false);
      }
    };

    fetchSections();
    return () => { cancelled = true; };
  }, []);

  // 2️⃣ Fetch standards based on section
  // 2️⃣ Fetch departments using jobroles-by-department API
useEffect(() => {
  let cancelled = false;

  const fetchDepartments = async () => {
    setLoadingStandards(true);

    try {
      const sessionData = getSessionData();
      if (!sessionData) {
        console.warn("Session data missing");
        setStandards([{ label: "Search Department", value: "" }]);
        return;
      }

      const apiUrl = `${sessionData.url}/api/jobroles-by-department?sub_institute_id=${sessionData.sub_institute_id}`;

      const res = await fetch(apiUrl, {
        headers: sessionData.token
          ? { Authorization: `Bearer ${sessionData.token}` }
          : {},
      });

      if (!res.ok) {
        console.error("Department fetch failed", res.status);
        setStandards([{ label: "Search Department", value: "" }]);
        return;
      }

      const data = await res.json();
      if (cancelled) return;

      const departmentsArray = [];

      // extract department names (keys)
      if (data?.data && typeof data.data === "object") {
        for (const [departmentName, jobroles] of Object.entries(data.data)) {
          if (Array.isArray(jobroles) && jobroles.length > 0) {
            const deptId = jobroles[0].department_id; // first item's department id
            departmentsArray.push({
              label: departmentName,
              value: deptId,
            });
          }
        }
      }

      setStandards([
        { label: "Select Department", value: "" },
        ...departmentsArray,
      ]);
    } catch (err) {
      if (!cancelled) {
        console.error("Dept API error:", err);
        setStandards([{ label: "Select Department", value: "" }]);
      }
    } finally {
      if (!cancelled) setLoadingStandards(false);
    }
  };

  fetchDepartments();
  return () => (cancelled = true);
}, []);


  // 3️⃣ Fetch subjects based on standard
  useEffect(() => {
    let cancelled = false;
    const fetchSubjects = async () => {
      if (!mergedForm.searchStandard) {
        setSubjects([{ label: 'Select Course', value: '' }]);
        return;
      }

      setLoadingSubjects(true);
      try {
        const sessionData = getSessionData();
        if (!sessionData) {
          console.warn('Session data not found.');
          setSubjects([{ label: 'Select Subject', value: '' }]);
          return;
        }

        const base = sessionData.url?.replace(/\/$/, '') ?? '';
        const apiUrl = `${base}/lms/ajax_LMS_StandardwiseSubject?std_id=${encodeURIComponent(
          mergedForm.searchStandard
        )}&type=API&sub_institute_id=${encodeURIComponent(sessionData.sub_institute_id)}`;

        const res = await fetch(apiUrl, {
          headers: sessionData.token ? { Authorization: `Bearer ${sessionData.token}` } : {}
        });

        if (!res.ok) {
          console.error('Subjects fetch failed', res.status, await res.text());
          setSubjects([{ label: 'Select Subject', value: '' }]);
          return;
        }

        const data = await res.json();
        if (cancelled) return;

        let formatted = [{ label: 'Select Subject', value: '' }];

        if (Array.isArray(data)) {
          formatted = [
            { label: 'Select Subject', value: '' },
            ...data.map(item => ({
              label: item.display_name || item.name || item.title || String(item.id),
              value: item.id
            }))
          ];
        } else if (data && typeof data === 'object') {
          formatted = [
            { label: 'Select Subject', value: '' },
            ...Object.entries(data).map(([id, name]) => ({
              label: String(name),
              value: id
            }))
          ];
        }

        setSubjects(formatted);
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching subjects:', err);
          setSubjects([{ label: 'Select Subject', value: '' }]);
        }
      } finally {
        if (!cancelled) setLoadingSubjects(false);
      }
    };

    fetchSubjects();
    return () => { cancelled = true; };
  }, [mergedForm.searchStandard]);

  // 4️⃣ Fetch chapters based on subject + standard
  useEffect(() => {
    let cancelled = false;
    const fetchChapters = async () => {
      if (!mergedForm.subject || !mergedForm.searchStandard) {
        setChapters([{ label: 'Select Module', value: '' }]);
        return;
      }

      setLoadingChapters(true);
      try {
        const sessionData = getSessionData();
        if (!sessionData) {
          console.warn('Session data not found.');
          setChapters([{ label: 'Select Chapter', value: '' }]);
          return;
        }

        const base = sessionData.url?.replace(/\/$/, '') ?? '';
        const apiUrl = `${base}/lms/ajax_LMS_SubjectwiseChapter?sub_id=${encodeURIComponent(
          mergedForm.subject
        )}&std_id=${encodeURIComponent(mergedForm.searchStandard)}&sub_institute_id=${encodeURIComponent(
          sessionData.sub_institute_id
        )}&type=API`;

        const res = await fetch(apiUrl, {
          headers: sessionData.token ? { Authorization: `Bearer ${sessionData.token}` } : {}
        });

        if (!res.ok) {
          console.error('Chapters fetch failed', res.status, await res.text());
          setChapters([{ label: 'Search By Chapter', value: '' }]);
          return;
        }

        const data = await res.json();
        if (cancelled) return;

        let formatted = [{ label: 'select Chapter', value: '' }];

        if (Array.isArray(data)) {
          formatted = [
            { label: 'select Chapter', value: '' },
            ...data.map(item => ({
              label: item.chapter_name || item.title || `Chapter ${item.id}`,
              value: item.id
            }))
          ];
        } else if (data && typeof data === 'object') {
          formatted = [
            { label: 'Select Chapter', value: '' },
            ...Object.entries(data).map(([id, name]) => ({
              label: String(name),
              value: id
            }))
          ];
        }

        setChapters(formatted);
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching chapters:', err);
          setChapters([{ label: 'Search By Chapter', value: '' }]);
        }
      } finally {
        if (!cancelled) setLoadingChapters(false);
      }
    };

    fetchChapters();
    return () => { cancelled = true; };
  }, [mergedForm.subject, mergedForm.searchStandard]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select
          label="Search Industry"
          value={mergedForm.searchSection}
          onChange={(val) => handleChange('searchSection', val)}
          options={sections}
          disabled={loadingSections}
        />

        <Select
          label="Select Department"
          value={mergedForm.searchStandard}
          onChange={(val) => handleChange('searchStandard', val)}
          options={standards}
          disabled={loadingStandards}
        />

        <Select
          label="Select Course"
          value={mergedForm.subject}
          onChange={(val) => handleChange('subject', val)}
          options={subjects}
          disabled={loadingSubjects}
        />

        <Select
          label="Select Module"
          value={mergedForm.searchByChapter}
          onChange={(val) => handleChange('searchByChapter', val)}
          options={chapters}
          multiple
          disabled={loadingChapters}
        />
      </div>

      {showAdditionalFields && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            label="Search By Topic"
            value={mergedForm.searchByTopic}
            onChange={(e) => handleChange('searchByTopic', e.target.value)}
          />
          <Input
            label="Search By Mapping Type"
            value={mergedForm.searchByMappingType}
            onChange={(e) => handleChange('searchByMappingType', e.target.value)}
          />
          <Input
            label="Search By Mapping Value"
            value={mergedForm.searchByMappingValue}
            onChange={(e) => handleChange('searchByMappingValue', e.target.value)}
          />
        </div>
      )}

      {showSearchButton && (
        <Button onClick={onSearch} className="bg-[#f5f5f5] text-black hover:bg-gray-200 transition-colors">Search</Button>
      )}
    </div>
  );
};

export default SearchFilters;