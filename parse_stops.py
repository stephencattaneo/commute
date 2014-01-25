#!/usr/bin/env python

from collections import defaultdict as dd
import json
from datetime import time

input_file = 'bart_stop_times.txt'
output_file = 'bart_stop_times.js'
data = dd(dict)

class TimeFriendlyEncoder(json.JSONEncoder):
  def default(self, obj):
    if type(obj) == time:
      return obj.strftime('%H:%M:%S')
    else:
      return json.JSONEncoder.default(obj)


def run():
  fd = open(input_file)
  for l in fd.readlines():
    trip_id,arrival_time,departure_time,stop_id,stop_sequence,stop_headsign,pickup_type,drop_off_type = l.split(',')  

    if 'SAT' in trip_id or 'SUN' in trip_id:
      continue

    if stop_id  == 'FTVL' or stop_id == 'FRMT':
      try:
        t = [int(x) for x in arrival_time.split(':')]
        
        data[trip_id][stop_id] = time(*t)
      except ValueError, e:
        pass #we don't care about midnight or 1 am trains

  fd.close()

  north_bound = []
  south_bound = []

  for key in data:
    if len(data[key]) == 2:
      if data[key]['FTVL'] > data[key]['FRMT']:
        north_bound.append(data[key])
      else:
        south_bound.append(data[key])

  north_bound.sort(cmp=lambda x, y: -1 if x['FRMT'] < y['FRMT'] else 1)
  south_bound.sort(cmp=lambda x, y: -1 if x['FTVL'] < y['FTVL'] else 1)

  fd = open(output_file, 'w')
  fd.write('bart_stop_times=')
  json.dump({'north_bound': north_bound, 'south_bound': south_bound}, fd, cls=TimeFriendlyEncoder)
  fd.close()

if __name__ == '__main__':
  run()
