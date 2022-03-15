import { jest, expect, describe, test, beforeEach } from '@jest/globals'

import config from '../../../server/config.js'
import { Controller } from '../../../server/controller.js'
import { handler } from '../../../server/routes.js'
import TestUtil from '../_utils/testUtil.js'

const { constants, location, pages } = config

describe('Routes - api response', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })
  test('GET / - should redirect to home page', async () => {
    const params = TestUtil.defaultHandleParams()
    params.request.method = 'GET'
    params.request.url = '/'
    await handler(...params.values())

    expect(params.response.end).toHaveBeenCalled()
    expect(params.response.writeHead).toHaveBeenCalledWith(
      302,
      { 'Location': location.home }
    )
  })
  
  test(
    `GET /home - should response with ${pages.homeHTML} file stream`,
    async () => {
      const params = TestUtil.defaultHandleParams()
      params.request.method = 'GET'
      params.request.url = '/home'
      const mockFileStream = TestUtil.generateReadableStream(['data'])

      jest.spyOn(
        Controller.prototype,
        Controller.prototype.getFileStream.name,
      ).mockResolvedValue({
        stream: mockFileStream
      })

      jest.spyOn(
        mockFileStream,
        'pipe'
      ).mockResolvedValue()

      await handler(...params.values())

      expect(Controller.prototype.getFileStream).toBeCalledWith(pages.homeHTML)
      expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
    }
  )
  test(
    `GET /home - should response with ${pages.controllerHTML} file stream`,
    async () => {
      const params = TestUtil.defaultHandleParams()
      params.request.method = 'GET'
      params.request.url = '/controller'
      const mockFileStream = TestUtil.generateReadableStream(['data'])

      jest.spyOn(
        Controller.prototype,
        Controller.prototype.getFileStream.name,
      ).mockResolvedValue({
        stream: mockFileStream
      })

      jest.spyOn(
        mockFileStream,
        'pipe'
      ).mockResolvedValue()

      await handler(...params.values())

      expect(Controller.prototype.getFileStream).toBeCalledWith(pages.controllerHTML)
      expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
    }
  )
  test(
    `GET /file.css - should response with file stream`,
    async () => {
      const params = TestUtil.defaultHandleParams()
      params.request.method = 'GET'
      params.request.url = '/home/style.css'
      const mockFileStream = TestUtil.generateReadableStream(['data'])

      jest.spyOn(
        Controller.prototype,
        Controller.prototype.getFileStream.name,
      ).mockResolvedValue({
        stream: mockFileStream,
        type: '.css'
      })

      jest.spyOn(
        mockFileStream,
        'pipe'
      ).mockResolvedValue()

      await handler(...params.values())

      expect(Controller.prototype.getFileStream).toBeCalledWith('/home/style.css')
      expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
      expect(params.response.writeHead).toHaveBeenCalledWith(
        200,
        { 'Content-Type': constants.CONTENT_TYPE['.css'] }
      )
    }
  )

  test(
    `GET /file.ext - should response with file stream`,
    async () => {
      const params = TestUtil.defaultHandleParams()
      params.request.method = 'GET'
      params.request.url = '/file.ext'
      const mockFileStream = TestUtil.generateReadableStream(['data'])

      jest.spyOn(
        Controller.prototype,
        Controller.prototype.getFileStream.name,
      ).mockResolvedValue({
        stream: mockFileStream,
        type: '.ext'
      })

      jest.spyOn(
        mockFileStream,
        'pipe'
      ).mockResolvedValue()

      await handler(...params.values())

      expect(Controller.prototype.getFileStream).toBeCalledWith('/file.ext')
      expect(mockFileStream.pipe).toHaveBeenCalledWith(params.response)
      expect(params.response.writeHead).not.toHaveBeenCalled()
    }
  )

  test(
    `GET /unknown - should response with 404 for  an inexistent route`,
    async () => {
      const params = TestUtil.defaultHandleParams()
      params.request.method = 'POST'
      params.request.url = '/controller'
      await handler(...params.values())

      expect(params.response.writeHead).toHaveBeenCalledWith(404)
      expect(params.response.end).toHaveBeenCalled()
    }
  )

  describe('exceptions', () => {
    test('given an inexistent file it should respond with 404',
      async () => {
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'GET'
        params.request.url = '/index.png'
        await handler(...params.values())

        jest.spyOn(
          Controller.prototype,
          Controller.prototype.getFileStream.name
        ).mockRejectedValue(new Error('ENOENT'))

        expect(params.response.writeHead).toHaveBeenCalledWith(404)
        expect(params.response.end).toHaveBeenCalled()
      }
    )
    test('given an error it should respond with 500', 
      async () => {
        const params = TestUtil.defaultHandleParams()
        params.request.method = 'GET'
        params.request.url = '/index.png'

        jest.spyOn(
          Controller.prototype,
          Controller.prototype.getFileStream.name
        ).mockRejectedValue(new Error('Error'))

        await handler(...params.values())

        expect(params.response.writeHead).toHaveBeenCalledWith(500)
        expect(params.response.end).toHaveBeenCalled()
      }
    )
  })
})

