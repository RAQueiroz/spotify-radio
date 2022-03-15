import { jest, expect, describe, test, beforeEach } from '@jest/globals'
import fsPromises from 'fs/promises'
import fs from 'fs'

import { Service } from '../../../server/service.js'
import TestUtil from '../_utils/testUtil.js'

describe('Service - processing', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })
  test(`getFileStream should return a stream and it's type`, async () => {
    const service = new Service()

    jest.spyOn(
      fs,
      fs.createReadStream.name
    ).mockReturnValue(TestUtil.generateReadableStream(['file']))

    jest.spyOn(
      fsPromises,
      fsPromises.access.name
    ).mockReturnValue(Promise.resolve())

    const { stream, type } = await service.getFileStream('index.html')

    expect(type).toBe('.html')
    expect(typeof stream.pipe).toBe('function')
  })
})
  
