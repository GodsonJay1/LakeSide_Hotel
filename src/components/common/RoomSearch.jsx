import moment from 'moment'
import React, { useState } from 'react'
import { getAvailableRooms } from '../utils/ApiFunctions'
import { Button, Col, Container, Form, Row } from 'react-bootstrap'
import RoomTypeSelector from './RoomTypeSelector'
import RoomSearchResult from './RoomSearchResult'

const RoomSearch = () => {
    const[searchQuery, setSearchQuery] = useState({
        checkInDate : "",
        checkOutDate : "",
        roomType : ""
    })
    const[errorMessage, setErrorMessage] = useState("")
    const[availableRooms, setAvailableRooms] = useState([])
    const[isLoading, setIsLoading] = useState(false)

    const handleSearch = (e) => {
        e.preventDefault();
        const checkInMoment = moment(searchQuery.checkInDate)
        const checkOutMoment = moment(searchQuery.checkOutDate)
        if(!checkInMoment.isValid() || !checkOutMoment.isValid()){
            setErrorMessage("Please enter valid date range")
            return
        }
        if(!checkOutMoment.isSameOrAfter(checkInMoment)){
            setErrorMessage("Check-in Date must come before check-in date")
            return
        }
        setIsLoading(true)
        getAvailableRooms(searchQuery.checkInDate, 
            searchQuery.checkOutDate, searchQuery.roomType).then((response) => {
                setAvailableRooms(response.data)
                setTimeout(() => {
                    setIsLoading(false)
                }, 2000)
            }).catch((error) => {
                console.error(error)
            }).finally(() => {
                setIsLoading(false)
            })
    }

    const handleInputChange = (e) => {
        const {name, value} = e.target
        setSearchQuery({...searchQuery, [name] : value})
        const checkInDate = moment(searchQuery.checkInDate)
        const checkOutDate = moment(searchQuery.checkOutDate)
        if(checkIn.isValid() && checkOut.isValid()){
            setErrorMessage("")
        }
    }

    const handleClearSearch = () => {
        setSearchQuery({
            checkInDate : "",
            checkOutDate : "",
            roomType : ""
        })
        setAvailableRooms([])
    }

  return (
    <>
      <Container className='mt-5 mb-5 py-5 shadow'>
        <Form onSubmit={handleSearch}>
          <Row className='justify-content-center'>

            <Col xs={12} md={3}>
              <Form.Group controlId='checkInDate'>
                <Form.Label>
                  Check-in date
                </Form.Label>
                <Form.Control 
                type='date' 
                name='checkInDate' 
                value={searchQuery.checkInDate}
                onChange={handleInputChange}
                min={moment().format("YYYY-MM-DD")}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={3}>
              <Form.Group controlId='checkOutDate'>
                <Form.Label>
                  Check-out date
                </Form.Label>
                <Form.Control 
                type='date' 
                name='checkOutDate' 
                value={searchQuery.checkOutDate}
                onChange={handleInputChange}
                min={moment().format("YYYY-MM-DD")}
                />
              </Form.Group>
            </Col>

            <Col xs={12} md={3}>
              <Form.Group>
                <Form.Label>
                  Room Type
                </Form.Label>
                <div className='d-flex'>
                  <RoomTypeSelector
                  handleRoomInputChange={handleInputChange}
                  newRoom={searchQuery}
                  />
                  <Button variant='secondary' type='submit'>Search</Button>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Form>

        {isLoading ? (
          <p>finding available rooms...</p>
        ) : availableRooms ? (
          <RoomSearchResult
          results={availableRooms}
          onClearSearch={handleClearSearch}
          />
        ) : (
          <p>No rooms available for the selected dates and room type</p>
        )}
        {errorMessage && <p className='text-danger'>{errorMessage}</p>}
      </Container>
    </>
  )
}
export default RoomSearch