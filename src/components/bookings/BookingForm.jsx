import React, { useEffect, useState } from 'react'
import { bookRoom, getRoomById } from '../utils/ApiFunctions'
import moment from 'moment'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, FormControl } from 'react-bootstrap'
import BookingSummary from './BookingSummary'

const BookingForm = () => {
    const[isValidated, setIsValidated] = useState(false)
    const[isSubmitted, setIsSubmitted] = useState(false)
    const[errorMessage, setErrorMessage] = useState("")
    const[roomPrice, setRoomPrice] = useState(0)
    const[booking, setBooking] = useState({
        guestFullName : "",
        guestEmail : "",
        checkInDate : "",
        checkOutDate : "",
        numOfAdults : "",
        numOfChildren : "",
    })
    const[roomInfo, setRoomInfo] = useState({
        photo : "",
        roomType : "",
        roomPrice : ""
    })

    const{roomId} = useParams()
    const navigate = useNavigate()

    const handleInputChange = (e) => {
        const{name, value} = e.target
        setBooking({...booking, [name]: value})
        setErrorMessage("")
    }

    const getRoomPriceById = async(roomId) => {
        try{
            const response = await getRoomById(roomId)
            setRoomPrice(response.roomPrice)
        }catch(error){
            throw new Error(error)
        }
    }

    useEffect(() =>{
        getRoomPriceById(roomId)
    }, [roomId])

    const calculatePayment = () => {
        const checkInDate = moment(booking.checkInDate)
        const checkOutDate = moment(booking.checkOutDate)
        const diffInDays = checkOutDate.diff(checkInDate, 'days')
        const price = roomPrice ? roomPrice : 0
        return diffInDays * price
    }

    const isGuestCountValid = () =>{
        const adultCount = parseInt(booking.numOfAdults)
        const childrenCount = parseInt(booking.numOfChildren)
        const totalCount = adultCount + childrenCount
        return totalCount >= 1 && adultCount >= 1
    }

    const IsCheckedOutDateValid = () => {
        if(!moment(booking.checkOutDate).isSameOrAfter(moment(booking.checkInDate))){
            setErrorMessage("Check-out date must come before check-in date")
            return false
        }else{
            setErrorMessage("")
        return true
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        const form = e.currentTarget
        if(form.checkValidity()=== false || !isGuestCountValid() || !IsCheckedOutDateValid()){
            e.stopPropagation()
        }else{
            setIsSubmitted(true)
        }
        setIsValidated(true)
    }

    const handleBooking = async() => {
        try{
            const confirmationCode = await bookRoom(roomId, booking)
            setIsSubmitted(true)
            navigate('/booking-success', {state: {message : confirmationCode}})
        }catch(error){
            setErrorMessage(error.message)
            navigate('/booking-success', {state: {error : errorMessage}})
        }
    }

  return (
    <>
      <div className='container mb-5'>
        <div className='row'>
          <div className='col-md-6'>
            <div className='card card-body mt-5'>
              <h4 className='card-title'>Reserve Room</h4>
              <Form noValidate validated={isValidated} onSubmit={handleSubmit}>
                <Form.Group>
                  <Form.Label htmlFor='guestFullName' className='hotel-color'>
                    Full name
                  </Form.Label>
                  <FormControl 
                    required
                    type='text'
                    id='guestFullName'
                    name='guestFullName'
                    value={booking.guestFullName}
                    placeholder='Enter Your Full Name'
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type='invalid'>
                    Please enter your full name
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group>
                  <Form.Label htmlFor='guestEmail' className='hotel-color'>Email</Form.Label>
                  <FormControl 
                    required
                    type='email'
                    id='guestEmail'
                    name='guestEmail'
                    value={booking.guestEmail}
                    placeholder='Enter Your Email'
                    onChange={handleInputChange}
                  />
                  <Form.Control.Feedback type='invalid'>
                    Please enter your email address
                  </Form.Control.Feedback>
                </Form.Group>

                <fieldset style={{border: "2px"}}>
                    <legend>Lodging period</legend>
                    <div className='row'>
                      <div className='col-6'>   
                        <Form.Label htmlFor='checkInDate' className='hotel-color'>Check-in date</Form.Label>
                        <FormControl 
                            required
                            type='date'
                            id='checkInDate'
                            name='checkInDate'
                            value={booking.checkInDate}
                            placeholder='Check-In Date'
                            onChange={handleInputChange}
                        />
                        <Form.Control.Feedback type='invalid'>
                          Please select a check-In date
                        </Form.Control.Feedback>           
                      </div>

                      <div className='col-6'> 
                        <Form.Label htmlFor='checkOutDate' className='hotel-color'>Check-out date</Form.Label>
                        <FormControl 
                        required
                        type='date'
                        id='checkOutDate'
                        name='checkOutDate'
                        value={booking.checkOutDate}
                        placeholder='Check-In Date'
                        min={moment().format("YYYY-MM-DD")}
                        onChange={handleInputChange}
                        />
                        <Form.Control.Feedback type='invalid'>
                          Please select a check-out date
                        </Form.Control.Feedback>              
                      </div>
                      {errorMessage && <p className='error-message text-danger'>{errorMessage}</p>}
                    </div>
                </fieldset>

                <fieldset>
                  <legend>Number of Guests</legend>
                  <div className='row'>
                    <div className='col-6'>
                        <Form.Label htmlFor='numOfAdults' className='hotel-color'>Adults</Form.Label>
                        <FormControl 
                        required
                        type='number'
                        id='numOfAdults'
                        name='numOfAdults'
                        value={booking.numOfAdults}
                        placeholder='0'
                        min={1}
                        onChange={handleInputChange}
                        />
                        <Form.Control.Feedback type='invalid'>
                          Please select at least 1 adult
                        </Form.Control.Feedback>            
                    </div>

                    <div className='col-6'>
                        <Form.Label htmlFor='numOfChildren' className='hotel-color'>Children</Form.Label>
                        <FormControl 
                        required
                        type='number'
                        id='numOfChildren'
                        name='numOfChildren'
                        value={booking.numOfChildren}
                        placeholder='0'
                        onChange={handleInputChange}
                        />
                        <Form.Control.Feedback type='invalid'>
                          Select 0 if no children
                        </Form.Control.Feedback>                    
                    </div>
                  </div>
                </fieldset>

                <div className='form-group mt-2 mb-2'>
                  <button type='submit' className='btn btn-hotel'>
                    Continue
                  </button>
                </div>
              </Form>
            </div>
          </div>
          <div className='col-md-6'>
            {isSubmitted && (
              <BookingSummary
                booking={booking}
                payment={calculatePayment()}
                onConfirm={handleBooking}
                isFormValid={isValidated}
              />
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default BookingForm