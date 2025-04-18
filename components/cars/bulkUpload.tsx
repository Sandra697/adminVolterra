"use client"

import { useState, useRef } from "react"
import * as XLSX from "xlsx"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { Download, Upload, AlertCircle, CheckCircle2 } from "lucide-react"

// Define the car data structure based on your Prisma schema
interface CarUploadData {
  name: string
  price: number
  description: string
  shortDescription: string
  brandId: number
  model: string
  mileage: number
  status: "NEW" | "USED" 
  seats: number
  color: string
  yearOfManufacture: number
  currentLocation: string
  drive: string
  engineSize: number
  enginePower: number
  fuelType: string
  horsePower: number
  transmission: string
  torque?: string
  aspiration?: string
  acceleration?: number
}

export function BulkCarUpload() {
  const [isOpen, setIsOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errors, setErrors] = useState<string[]>([])
  const [successCount, setSuccessCount] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sampleData: CarUploadData[] = [
    {
      name: "Toyota Camry",
      price: 25000,
      description: "A reliable family sedan with great fuel economy",
      shortDescription: "Reliable family sedan",
      brandId: 1, // Assuming Toyota has ID 1 in your database
      model: "Camry",
      mileage: 0,
      status: "NEW",
      seats: 5,
      color: "Silver",
      yearOfManufacture: 2023,
      currentLocation: "New York",
      drive: "FWD",
      engineSize: 2.5,
      enginePower: 203,
      fuelType: "Gasoline",
      horsePower: 203,
      transmission: "Automatic",
      torque: "184 lb-ft",
      aspiration: "Naturally Aspirated",
      acceleration: 7.5
    },
    {
      name: "Honda Accord",
      price: 27000,
      description: "Sporty mid-size sedan with advanced safety features",
      shortDescription: "Sporty mid-size sedan",
      brandId: 2, // Assuming Honda has ID 2 in your database
      model: "Accord",
      mileage: 10,
      status: "NEW",
      seats: 5,
      color: "Blue",
      yearOfManufacture: 2023,
      currentLocation: "Los Angeles",
      drive: "FWD",
      engineSize: 1.5,
      enginePower: 192,
      fuelType: "Gasoline",
      horsePower: 192,
      transmission: "CVT",
      torque: "192 lb-ft",
      aspiration: "Turbocharged",
      acceleration: 7.2
    }
  ]

  // Download sample Excel template
  const downloadSample = () => {
    const worksheet = XLSX.utils.json_to_sheet(sampleData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cars")
    
    // Add column headers
    XLSX.utils.sheet_add_aoa(worksheet, [Object.keys(sampleData[0])], { origin: "A1" })
    
    // Generate Excel file
    XLSX.writeFileXLSX(workbook, "car_upload_template.xlsx")
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setErrors([])
      setSuccessCount(0)
      setIsCompleted(false)
    }
  }

  // Parse Excel file and validate data
  const parseExcel = async (file: File): Promise<CarUploadData[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = e.target?.result
          const workbook = XLSX.read(data, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)
          
          // Basic validation
          const validatedData: CarUploadData[] = []
          const errors: string[] = []
          
          jsonData.forEach((row: any, index) => {
            // Check required fields
            const requiredFields = [
              'name', 'price', 'description', 'shortDescription', 
              'brandId', 'model', 'status', 'seats', 'color', 
              'yearOfManufacture', 'currentLocation', 'drive', 
              'engineSize', 'enginePower', 'fuelType', 'horsePower', 'transmission'
            ]
            
            const missingFields = requiredFields.filter(field => !row[field])
            if (missingFields.length > 0) {
              errors.push(`Row ${index + 2}: Missing required fields: ${missingFields.join(', ')}`)
              return
            }
            
            // Check numeric fields
            const numericFields = ['price', 'mileage', 'brandId', 'seats', 'yearOfManufacture', 'engineSize', 'enginePower', 'horsePower']
            const nonNumericFields = numericFields.filter(field => isNaN(Number(row[field])))
            if (nonNumericFields.length > 0) {
              errors.push(`Row ${index + 2}: These fields must be numbers: ${nonNumericFields.join(', ')}`)
              return
            }
            
            // Check status field
            if (row.status !== 'NEW' && row.status !== 'USED') {
              errors.push(`Row ${index + 2}: Status must be either "NEW" or "USED"`)
              return
            }
            
            // Convert to proper data types
            const carData: CarUploadData = {
              name: String(row.name),
              price: Number(row.price),
              description: String(row.description),
              shortDescription: String(row.shortDescription),
              brandId: Number(row.brandId),
              model: String(row.model),
              mileage: Number(row.mileage || 0),
              status: row.status,
              seats: Number(row.seats),
              color: String(row.color),
              yearOfManufacture: Number(row.yearOfManufacture),
              currentLocation: String(row.currentLocation),
              drive: String(row.drive),
              engineSize: Number(row.engineSize),
              enginePower: Number(row.enginePower),
              fuelType: String(row.fuelType),
              horsePower: Number(row.horsePower),
              transmission: String(row.transmission),
              torque: row.torque ? String(row.torque) : undefined,
              aspiration: row.aspiration ? String(row.aspiration) : undefined,
              acceleration: row.acceleration ? Number(row.acceleration) : undefined,
            }
            
            validatedData.push(carData)
          })
          
          if (errors.length > 0) {
            reject(errors)
          } else {
            resolve(validatedData)
          }
        } catch (error) {
          reject(['Failed to parse Excel file. Please make sure the format is correct.'])
        }
      }
      
      reader.onerror = () => {
        reject(['Error reading the file.'])
      }
      
      reader.readAsBinaryString(file)
    })
  }

  // Upload cars in batches
  const uploadCars = async (cars: CarUploadData[]) => {
    const batchSize = 5 // Process 5 cars at a time
    const totalCars = cars.length
    let processed = 0
    let succeeded = 0
    const uploadErrors: string[] = []

    setUploading(true)
    setProgress(0)
    setErrors([])
    setSuccessCount(0)
    
    try {
      // Process cars in batches
      for (let i = 0; i < totalCars; i += batchSize) {
        const batch = cars.slice(i, i + batchSize)
        
        // Process each car in the batch
        const batchPromises = batch.map(async (car, batchIndex) => {
          try {
            const response = await fetch('/api/cars/bulk', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(car),
            })
            
            if (!response.ok) {
              const error = await response.json()
              throw new Error(error.message || 'Failed to upload car')
            }
            
            succeeded++
            return true
          } catch (error) {
            uploadErrors.push(`Failed to upload ${car.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
            return false
          }
        })
        
        await Promise.all(batchPromises)
        processed += batch.length
        
        // Update progress
        const currentProgress = Math.floor((processed / totalCars) * 100)
        setProgress(currentProgress)
        setSuccessCount(succeeded)
        
        // Small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      
      setIsCompleted(true)
      if (uploadErrors.length === 0) {
        toast({
          title: "Upload Successful",
          description: `Successfully uploaded ${succeeded} cars.`,
        })
      } else {
        setErrors(uploadErrors)
        toast({
          title: "Upload Partially Successful",
          description: `Uploaded ${succeeded} cars with ${uploadErrors.length} errors.`,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error during upload:", error)
      setErrors([`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`])
      toast({
        title: "Upload Failed",
        description: "An error occurred during the upload process.",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  // Handle upload process
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select an Excel file to upload.",
        variant: "destructive",
      })
      return
    }

    try {
      const cars = await parseExcel(file)
      if (cars.length === 0) {
        toast({
          title: "No Data Found",
          description: "The Excel file contains no valid car data.",
          variant: "destructive",
        })
        return
      }
      
      await uploadCars(cars)
    } catch (errors) {
      if (Array.isArray(errors)) {
        setErrors(errors)
      } else {
        setErrors([String(errors)])
      }
      toast({
        title: "Validation Failed",
        description: "Please check your Excel file for errors.",
        variant: "destructive",
      })
    }
  }

  // Reset the form
  const resetForm = () => {
    setFile(null)
    setErrors([])
    setSuccessCount(0)
    setProgress(0)
    setIsCompleted(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Close dialog and reset form
  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => {
      resetForm()
    }, 300)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Bulk Upload Cars
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md md:max-w-xl">
        <DialogHeader>
          <DialogTitle>Bulk Upload Cars</DialogTitle>
          <DialogDescription>
            Upload multiple cars at once using an Excel file. Download our template for the correct format.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <p className="text-[0.75rem] text-gray-700 font-medium   font-medium">Step 1: Download Template</p>
            <Button variant="outline" onClick={downloadSample}>
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>
          
          <div className="space-y-2">
            <p className="text-[0.75rem] text-gray-700 font-medium   font-medium">Step 2: Upload Your File</p>
            <div className="flex items-center gap-2">
              <input
                type="file"
                id="car-upload"
                className="hidden"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={uploading}
              />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full justify-start"
              >
                {file ? file.name : "Select Excel File"}
              </Button>
              {file && !uploading && (
                <Button 
                  variant="ghost"
                  size="sm"
                  onClick={resetForm}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
          
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-[0.75rem] text-gray-700 font-medium  ">Uploading... {progress}%</p>
                <p className="text-[0.75rem] text-gray-700 font-medium   text-muted-foreground">
                  {successCount} successful
                </p>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}
          
          {isCompleted && errors.length === 0 && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-600">Upload Complete</AlertTitle>
              <AlertDescription>
                Successfully uploaded {successCount} cars to the database.
              </AlertDescription>
            </Alert>
          )}
          
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                <div className="max-h-40 overflow-y-auto">
                  <ul className="list-disc pl-5 space-y-1">
                    {errors.slice(0, 10).map((error, index) => (
                      <li key={index} className="text-[0.75rem] text-gray-700 font-medium  ">{error}</li>
                    ))}
                    {errors.length > 10 && (
                      <li className="text-[0.75rem] text-gray-700 font-medium   font-medium">
                        ...and {errors.length - 10} more errors
                      </li>
                    )}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!file || uploading}
          >
            {uploading ? "Uploading..." : "Upload Cars"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}