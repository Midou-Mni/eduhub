import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Filter, 
  BookOpen, 
  Star, 
  Users, 
  Clock
} from "lucide-react";
import type { CourseWithDetails, Category } from "@shared/schema";

export default function CourseBrowse() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceFilter, setPriceFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");

  const filters = {
    search: searchQuery,
    category: selectedCategory === "all" ? "" : selectedCategory,
    price: priceFilter === "all" ? "" : priceFilter,
    difficulty: difficultyFilter === "all" ? "" : difficultyFilter,
  };

  const { data: courses, isLoading } = useQuery<CourseWithDetails[]>({
    queryKey: ["/api/student/courses", filters],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Query will automatically update due to searchQuery dependency
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setPriceFilter("all");
    setDifficultyFilter("all");
  };

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <BookOpen className="text-white" size={16} />
                </div>
                <span className="font-bold text-lg">EduPlatform</span>
              </div>
            </Link>

            <div className="flex items-center space-x-6">
              <Link href="/" className="text-neutral-700 hover:text-primary">Dashboard</Link>
              <Link href="/browse" className="text-primary font-medium">Browse</Link>
              <Link href="/my-courses" className="text-neutral-700 hover:text-primary">My Courses</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">Browse Courses</h1>
          <p className="text-neutral-600">
            Discover new skills and advance your career with our expert-led courses
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <Label htmlFor="search">Search Courses</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                    <Input
                      id="search"
                      placeholder="Search by title or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories?.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Levels</SelectItem>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="price">Price Range</Label>
                  <Select value={priceFilter} onValueChange={setPriceFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any Price" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Any Price</SelectItem>
                      <SelectItem value="0-50">$0 - $50</SelectItem>
                      <SelectItem value="50-100">$50 - $100</SelectItem>
                      <SelectItem value="100-200">$100 - $200</SelectItem>
                      <SelectItem value="200+">$200+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button type="submit">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Course Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-64 bg-neutral-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : courses && courses.length > 0 ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-neutral-600">
                Showing {courses.length} course{courses.length !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <Link key={course.id} href={`/course/${course.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="aspect-video bg-neutral-200 rounded-t-lg overflow-hidden">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-neutral-400" />
                        </div>
                      )}
                    </div>

                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <Badge variant="outline" className="mb-2">
                          {course.difficultyLevel}
                        </Badge>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            {formatPrice(course.price)}
                          </p>
                        </div>
                      </div>
                      <CardTitle className="text-lg line-clamp-2">
                        {course.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {course.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="flex items-center space-x-2 mb-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={course.teacher.profileImageUrl || undefined} />
                          <AvatarFallback>
                            {course.teacher.firstName?.charAt(0)}{course.teacher.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-neutral-600">
                          {course.teacher.firstName} {course.teacher.lastName}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-neutral-500">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-warning fill-current" />
                          <span>{course.avgRating?.toFixed(1) || 'New'}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{course.enrollmentCount} students</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{course.materials.length} lessons</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <BookOpen className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
            <h3 className="text-xl font-medium text-neutral-700 mb-2">No courses found</h3>
            <p className="text-neutral-500 mb-4">
              Try adjusting your search terms or filters
            </p>
            <Button onClick={clearFilters}>Clear Filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}
