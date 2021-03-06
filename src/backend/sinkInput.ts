import * as child from 'child_process'

import { Pactl } from './pactl'
import { StringUtils } from './stringUtils'

const { promisify } = require('util')

const exec = promisify(child.exec)

export class SinkInput {
  public static readonly CMD = 'sink-inputs'
  private id: any
  private sink: any
  private mute: any
  private volume: any
  private name: any

  public constructor(data: any) {
    // Sink input number
    this.id = data[0].slice(data[0].indexOf('#') + 1)
    // Sink number
    this.sink = data[1].slice(data[1].indexOf(':') + 2)
    // Mute
    this.mute = data[2].slice(data[2].indexOf(':') + 2)
    // Volume
    const volumes = data[3].match(/([\d]+%)/g)

    volumes.forEach((current: string, index: number, array: Array<string>) => {
      array[index] = StringUtils.rtrim(current, '%')
    })

    this.volume =
      volumes.reduce((a: string, b: string) => {
        return parseInt(a) + parseInt(b)
      }) / volumes[0].length
    // Name
    this.name = StringUtils.trim(data[4].slice(data[4].indexOf('=') + 2), '"')
  }
  public async setVolume(value: any) {
    await exec([Pactl.CMD, 'set-sink-input-volume', this.id, value + '%'].join(' '))
  }
  public async setMute(value: any) {
    await exec([Pactl.CMD, 'set-sink-input-mute', this.id, value].join(' '))
  }

  public async move(value: any) {
    await exec([Pactl.CMD, 'move-sink-input', this.id, value].join(' '))
  }

  public static sink_inputs_filter(data: any): boolean {
    const elements = ['Sink Input', 'Sink:', 'Mute', 'Volume:', 'application.name']
    let contained = false
    elements.forEach((element: any) => {
      if (data.trimStart().indexOf(element) === 0) {
        contained = true
      }
    })

    return contained
  }

  public toJSON(): Object {
    return {
      id: this.id,
      sink: this.sink,
      mute: this.mute,
      volume: this.volume,
      name: this.name
    }
  }
}
