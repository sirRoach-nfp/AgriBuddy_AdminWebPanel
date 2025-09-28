
import * as React from 'react';
import Button from '@mui/material/Button';
import './ArticleManagement.css'
import ArticleCard from '../../Components/ArticleCard/ArticleCard';
import { useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { db } from '../../firebaseconfig';
import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore';

//MUI imports

import TextField from '@mui/material/TextField';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import { useCallback, useEffect, useState } from 'react';




interface contentsType{

    content:string,
    header:string,
    id:string
}


interface articleType{
    Title:string,
    Cover:string,
    CreatedAt:any,
    Id:string,
    PreviewContext:string,
    
}


export default function ArticleManagement() {
  const navigate = useNavigate();

  // 🔹 States
  const [selectedOption, setSelectedOption] = useState("Descending");
  const [articles, setArticles] = useState<articleType[]>([]);
  const [sortedArticles, setSortedArticles] = useState<articleType[]>([]);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  // 🔹 Fetch from Firestore
 const fetchArticles = async (
  isLoadmore = false,
  search: string = "",
  lastDocParam: any = null
) => {
  setLoading(true);

  try {
    let q;
    const articlesRef = collection(db, "Articles");

    if (search) {
      // Search mode
      q = query(
        articlesRef,
        where("title", ">=", search),
        where("title", "<=", search + "\uf8ff"),
        orderBy("title"),
        limit(20)
      );
    } else {
      // Normal fetch with pagination
      q = lastDocParam
        ? query(
            articlesRef,
            orderBy("CreatedAt", "desc"),
            startAfter(lastDocParam),
            limit(20)
          )
        : query(articlesRef, orderBy("CreatedAt", "desc"), limit(20));
    }

    const snap = await getDocs(q);
    if (!snap.empty) {
      const rawData = snap.docs.map((doc) => ({
        Title: doc.data().title || "",
        Cover: doc.data().cover || "",
        CreatedAt: doc.data().CreatedAt || 0,
        Id: doc.id,
        PreviewContext: doc.data().contents?.[0]?.content || ""
      }));

    setArticles((prev) => {
      const combined = isLoadmore ? [...prev, ...rawData] : rawData;
      return combined.filter(
        (item, index, self) =>
          index === self.findIndex((t) => t.Id === item.Id)
      );
    });
      setLastDoc(snap.docs[snap.docs.length - 1]);
      setHasMore(snap.docs.length === 20);
    } else if (!isLoadmore) {
      setArticles([]);
      setHasMore(false);
    }
  } catch (err) {
    console.error("Error fetching articles:", err);
  } finally {
    setLoading(false);
  }
};

  // 🔹 Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setLastDoc(null); // reset pagination when searching
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 🔹 Fetch when search changes
  useEffect(() => {
    setArticles([]);   // reset so duplicates never carry over
    setLastDoc(null);
    fetchArticles(false, debouncedSearch);
  }, [debouncedSearch]);

  // 🔹 Initial fetch
  useEffect(() => {

    fetchArticles(false, "");

    return () => {
      // 🔹 Reset all states on unmount
      setArticles([]);
      setSortedArticles([]);
      setLastDoc(null);
      setSearchTerm("");
      setDebouncedSearch("");
      setHasMore(true);
      setLoading(false);
    };
  }, []);

  // 🔹 Re-sort whenever articles or sort option changes
  useEffect(() => {
    if (articles.length > 0) {
      const sorted = [...articles].sort((a, b) => {
        return selectedOption === "Ascending"
          ? a.CreatedAt - b.CreatedAt
          : b.CreatedAt - a.CreatedAt;
      });
      setSortedArticles(sorted);
    } else {
      setSortedArticles([]);
    }
  }, [articles, selectedOption]);

  // 🔹 Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleChange = (event: any) => {
    setSelectedOption(event.target.value);
  };

  const navigateToUpload = () => {
    navigate("/admin/article_upload");
  };

  return (
    <div className="mainWrapper">
      <div className="headerWrapper">
        <p className="headerSection__primary">Article Management</p>
        <span className="headerSection__secondary">Manage your articles</span>
        <hr />
      </div>

      <div className="contentWrapper" style={{border:'0px solid white'}}>
        <div className="filterWrapper">
          <Button
            sx={{ backgroundColor: "#607D8B", height: "40px" }}
            variant="contained"
            onClick={navigateToUpload}
          >
            Add Article
          </Button>

          <div className="filterWrapper__searchWrapper">
            <TextField
              variant="outlined"
              label="Search"
              value={searchTerm}
              onChange={handleSearchChange}
              fullWidth
              sx={{
                flex: "1 1 200px",
                "& .MuiInputBase-root": {
                  height: "40px",
                  boxSizing: "border-box",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 14px"
                },
                "& .MuiInputBase-input": {
                  padding: 0,
                  height: "100%",
                  boxSizing: "border-box"
                },
                "& .MuiInputLabel-root": {
                  top: "-6px"
                },
                "& label.Mui-focused": {
                  top: 0
                }
              }}
            />

            <Select
              labelId="dropdown-label"
              value={selectedOption}
              onChange={handleChange}
              sx={{
                height: "40px",
                minWidth: 120,
                "& .MuiSelect-select": {
                  padding: "10px 14px"
                }
              }}
            >
              <MenuItem value="Ascending">Ascending</MenuItem>
              <MenuItem value="Descending">Descending</MenuItem>
            </Select>
          </div>
        </div>

        <div className="articleCardsWrapper">
          {sortedArticles.length > 0 ? (
            sortedArticles.map((article) => (
              <ArticleCard
                key={article.Id}
                Id={article.Id}
                Title={article.Title}
                Cover={article.Cover}
                CreatedAt={article.CreatedAt}
                PreviewContext={article.PreviewContext}
              />
            ))
          ) : (
            <p className="fullWidth">No articles found</p>
          )}

          {!debouncedSearch && sortedArticles.length > 0 &&(
            <div className="fullWidth">
              <Button
                variant="outlined"
                style={{ width: "100%" }}
                sx={{
                  mt: 2,
                  backgroundColor: "#607D8B",
                  color: "white",
                  border: 0
                }}
                disabled={loading}
                onClick={() => fetchArticles(true, "", lastDoc)}
              >
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function async(arg0: boolean): any {
    throw new Error('Function not implemented.');
}
