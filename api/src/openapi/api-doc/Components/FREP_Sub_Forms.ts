export const FREP_Log = {
  type: 'object',
  properties: {
    log_num: {
      type: 'number',
      title: 'Log #'
    },
    species: {
      type: 'string',
      title: 'Species',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'tree_species_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      }
    },
    decay_class: {
      type: 'string',
      title: 'Decay Class',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'decay_class_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      }
    },
    diameter: {
      type: 'number',
      title: 'Diameter (cm)'
    },
    length: {
      type: 'number',
      title: 'Length (m)'
    }
  },
  required: ['log_num', 'species', 'decay_class', 'diameter', 'length']
};
export const FREP_Stand_Table = {
  type: 'object',
  properties: {
    tree_num: {
      type: 'number',
      title: 'Tree #'
    },
    species: {
      type: 'string',
      title: 'Species',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'tree_species_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      }
    },
    wt_class: {
      type: 'string',
      title: 'Wildlife Tree Class',
      'x-enum-code': {
        'x-enum-code-category-name': 'invasives',
        'x-enum-code-header-name': 'wildlife_tree_class_code',
        'x-enum-code-name': 'code_name',
        'x-enum-code-text': 'code_description',
        'x-enum-code-sort-order': 'code_sort_order'
      }
    },
    dbh: {
      type: 'number',
      title: 'DBH (cm)'
    },
    ht: {
      type: 'number',
      title: 'Ht (m)'
    }
  },
  required: ['tree_num', 'wt_class', 'species', 'dbh', 'ht']
};
export const FREP_FormA = {
  type: 'object',
  properties: {
    plot_identification: {
      type: 'object',
      title: 'Plot Identification',
      properties: {
        date: {
          type: 'string',
          format: 'date-time',
          title: 'Date'
        },
        opening_id: {
          type: 'string',
          title: 'Opening ID'
        },
        assessed_by: {
          type: 'string',
          title: 'Assessed By'
        },
        plot_number: {
          type: 'number',
          title: 'Plot #'
        },
        utm_zone: {
          type: 'string',
          title: 'UTM Zone',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'utm_zone_code',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          }
        },
        easting: {
          type: 'number',
          title: 'Easting'
        },
        northing: {
          type: 'number',
          title: 'Northing'
        }
      },
      required: ['opening_id', 'assessed_by', 'plot_number', 'utm_zone', 'easting', 'northing']
    },
    plot_identification_trees: {
      type: 'object',
      title: 'Plot Identification (Trees)',
      required: ['trees_exist'],
      properties: {
        trees_exist: {
          type: 'string',
          title: 'Trees Exist?',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'trees_exist_code',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          }
        }
      },
      dependencies: {
        trees_exist: {
          oneOf: [
            {
              properties: {
                trees_exist: {
                  enum: ['Yes']
                },
                baf: {
                  type: 'string',
                  title: 'BAF',
                  'x-enum-code': {
                    'x-enum-code-category-name': 'invasives',
                    'x-enum-code-header-name': 'basal_area_factor_code',
                    'x-enum-code-name': 'code_name',
                    'x-enum-code-text': 'code_description',
                    'x-enum-code-sort-order': 'code_sort_order'
                  }
                },
                fixed_area: {
                  type: 'number',
                  title: 'Fixed Area Radius (m)'
                },
                full_count_area: {
                  type: 'number',
                  title: 'Full Count Area (ha)'
                },
                tree_comments: {
                  type: 'string',
                  title: 'Comments (tree)'
                }
              }
            },
            {
              properties: {
                trees_exist: {
                  enum: ['No']
                }
              }
            }
          ]
        }
      }
    },
    stand_table: {
      type: 'array',
      title: 'Stand Table',
      items: {
        ...FREP_Stand_Table
      }
    },
    plot_information: {
      type: 'object',
      title: 'Plot Information (CWD)',
      required: ['cwd_in_transect'],
      properties: {
        cwd_in_transect: {
          type: 'string',
          title: 'CWT In Transect?',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'cwd_in_transect_code',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          }
        }
      },
      dependencies: {
        cwd_in_transect: {
          oneOf: [
            {
              properties: {
                cwd_in_transect: {
                  enum: ['Yes']
                },
                first_leg: {
                  type: 'number',
                  title: '1st Leg',
                  minimum: 0,
                  maximum: 360
                },
                second_leg: {
                  type: 'number',
                  title: '2nd Leg',
                  minimum: 0,
                  maximum: 360
                },
                log: {
                  type: 'array',
                  title: 'Logs',
                  items: {
                    ...FREP_Log
                  }
                },
                log_comments: {
                  type: 'string',
                  title: 'Comments (Logs)'
                }
              },
              required: ['first_leg', 'second_leg']
            },
            {
              properties: {
                cwd_in_transect: {
                  enum: ['No']
                }
              }
            }
          ]
        }
      }
    }
  }
};
export const FREP_FormB = {
  type: 'object',
  properties: {
    stratum_summary: {
      type: 'object',
      title: 'Stratum Summary',
      properties: {
        date: {
          type: 'string',
          format: 'date-time',
          title: 'Date'
        },
        opening_id: {
          type: 'string',
          title: 'Opening ID'
        },
        assessed_by: {
          type: 'string',
          title: 'Assessed By'
        },
        stratum_id: {
          type: 'string',
          title: 'Stratum ID',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'stratum_id_code',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          }
        },
        stratum_number: {
          type: 'string',
          title: 'Stratum Number',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'stratum_number_code',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          }
        },
        stratum_type: {
          type: 'string',
          title: 'Stratum Type',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'stratum_type_code',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          }
        },
        num_plots_stratum: {
          type: 'number',
          title: '# of Plots per Stratum'
        },
        mapped_stratum_size: {
          type: 'number',
          title: 'Other'
        },
        bec_zone: {
          type: 'string',
          title: 'BEC Zone',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'BEC_zone_code',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          }
        },
        subzone: {
          type: 'string',
          title: 'Subzone',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'BEC_subzone_code',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          }
        },
        variant: {
          type: 'string',
          title: 'Variant',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'BEC_variant_code',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          }
        },
        site_series: {
          type: 'string',
          title: 'Site Series',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'site_series_code',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          }
        },
        stratum_location_consistent: {
          type: 'string',
          title: 'Stratum location and size consistent with map?',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'stratum_consistent_code',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          },
          default: 'Yes'
        }
      },
      required: [
        'date',
        'opening_id',
        'assessed_by',
        'stratum_id',
        'stratum_number',
        'stratum_type',
        'num_plots_stratum',
        'mapped_stratum_size',
        'bec_zone',
        'subzone',
        'variant',
        'site_series',
        'stratum_location_consistent'
      ],
      dependencies: {
        stratum_location_consistent: {
          oneOf: [
            {
              properties: {
                stratum_location_consistent: {
                  enum: ['No']
                },
                estimated_size: {
                  type: 'number',
                  title: 'Estimated Size if Not Consistent with Map'
                }
              },
              required: ['estimated_size']
            },
            {
              properties: {
                stratum_location_consistent: {
                  enum: ['Yes']
                }
              }
            }
          ]
        }
      }
    },
    dispersed_summary: {
      type: 'object',
      title: 'Patch/Dispersed Summary',
      properties: {
        estimated_age_of_oldest_trees: {
          type: 'number',
          title: 'Estimated Age of Oldest Trees in Reserve (other than vets)'
        },
        patch_location: {
          type: 'string',
          title: 'Patch Location',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'patch_location_code',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          }
        },
        percent_trees_windthrown: {
          type: 'string',
          title: '% of Total Trees in Reserve Windthrown',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'pct_trees_windthrown_code',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          }
        },
        windthrow_distribution: {
          type: 'string',
          title: 'Distribution of Windthrow',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'distribution_of_windthrow_code',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          }
        },
        windthrow_treatment: {
          type: 'string',
          title: 'Windthrow Treatment',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'windthrow_treatment_code',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          }
        }
      },
      required: [
        'estimated_age_of_oldest_trees',
        'patch_location',
        'percent_trees_windthrown',
        'windthrow_distribution',
        'windthrow_treatment'
      ]
    },
    reserve_constraints: {
      type: 'object',
      title: 'Reserve Constraints',
      required: ['reserve_constraints_none'],
      properties: {
        reserve_constraints_none: {
          type: 'string',
          title: 'Were there any reserve constraints for this stratum?',
          default: 'No',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'reserve_constraints_none_code',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          }
        }
      },
      dependencies: {
        reserve_constraints_none: {
          oneOf: [
            {
              properties: {
                reserve_constraints_none: {
                  enum: ['Yes']
                },
                wetsite: {
                  type: 'string',
                  title: 'Wetsite',
                  'x-enum-code': {
                    'x-enum-code-category-name': 'invasives',
                    'x-enum-code-header-name': 'reserve_constraints_wetsite_code',
                    'x-enum-code-name': 'code_name',
                    'x-enum-code-text': 'code_description',
                    'x-enum-code-sort-order': 'code_sort_order'
                  }
                },
                rmz: {
                  type: 'string',
                  title: 'RMZ',
                  'x-enum-code': {
                    'x-enum-code-category-name': 'invasives',
                    'x-enum-code-header-name': 'reserve_constraints_RMZ_code',
                    'x-enum-code-name': 'code_name',
                    'x-enum-code-text': 'code_description',
                    'x-enum-code-sort-order': 'code_sort_order'
                  }
                },
                rrz: {
                  type: 'string',
                  title: 'RRZ',
                  'x-enum-code': {
                    'x-enum-code-category-name': 'invasives',
                    'x-enum-code-header-name': 'reserve_constraints_RRZ_code',
                    'x-enum-code-name': 'code_name',
                    'x-enum-code-text': 'code_description',
                    'x-enum-code-sort-order': 'code_sort_order'
                  }
                },
                rock_outcrop: {
                  type: 'string',
                  title: 'Rock Outcrop',
                  'x-enum-code': {
                    'x-enum-code-category-name': 'invasives',
                    'x-enum-code-header-name': 'reserve_constraints_rock_code',
                    'x-enum-code-name': 'code_name',
                    'x-enum-code-text': 'code_description',
                    'x-enum-code-sort-order': 'code_sort_order'
                  }
                },
                noncommercial_brush: {
                  type: 'string',
                  title: 'Non-Commercial Brush',
                  'x-enum-code': {
                    'x-enum-code-category-name': 'invasives',
                    'x-enum-code-header-name': 'reserve_constraints_ncbr_code',
                    'x-enum-code-name': 'code_name',
                    'x-enum-code-text': 'code_description',
                    'x-enum-code-sort-order': 'code_sort_order'
                  }
                },
                low_mercantile_timber: {
                  type: 'string',
                  title: 'Non (or Low) Mercantile Timber',
                  'x-enum-code': {
                    'x-enum-code-category-name': 'invasives',
                    'x-enum-code-header-name': 'reserve_constraints_non_merch_code',
                    'x-enum-code-name': 'code_name',
                    'x-enum-code-text': 'code_description',
                    'x-enum-code-sort-order': 'code_sort_order'
                  }
                },
                sensitive_terrain: {
                  type: 'string',
                  title: 'Sensitive Terrain or Soil',
                  'x-enum-code': {
                    'x-enum-code-category-name': 'invasives',
                    'x-enum-code-header-name': 'reserve_constraints_sensitive_code',
                    'x-enum-code-name': 'code_name',
                    'x-enum-code-text': 'code_description',
                    'x-enum-code-sort-order': 'code_sort_order'
                  }
                },
                uwr_wha_whf: {
                  type: 'string',
                  title: 'UWR/WHA/WHF',
                  'x-enum-code': {
                    'x-enum-code-category-name': 'invasives',
                    'x-enum-code-header-name': 'reserve_constraints_wildlife_des_code',
                    'x-enum-code-name': 'code_name',
                    'x-enum-code-text': 'code_description',
                    'x-enum-code-sort-order': 'code_sort_order'
                  }
                },
                ogma: {
                  type: 'string',
                  title: 'OGMA',
                  'x-enum-code': {
                    'x-enum-code-category-name': 'invasives',
                    'x-enum-code-header-name': 'reserve_constraints_OGMA_code',
                    'x-enum-code-name': 'code_name',
                    'x-enum-code-text': 'code_description',
                    'x-enum-code-sort-order': 'code_sort_order'
                  }
                },
                visuals: {
                  type: 'string',
                  title: 'Visuals',
                  'x-enum-code': {
                    'x-enum-code-category-name': 'invasives',
                    'x-enum-code-header-name': 'reserve_constraints_visual_code',
                    'x-enum-code-name': 'code_name',
                    'x-enum-code-text': 'code_description',
                    'x-enum-code-sort-order': 'code_sort_order'
                  }
                },
                cultural_heritage_feature: {
                  type: 'string',
                  title: 'Cultural Heritage Feature',
                  'x-enum-code': {
                    'x-enum-code-category-name': 'invasives',
                    'x-enum-code-header-name': 'reserve_constraints_cultural_code',
                    'x-enum-code-name': 'code_name',
                    'x-enum-code-text': 'code_description',
                    'x-enum-code-sort-order': 'code_sort_order'
                  }
                },
                recreation_feature: {
                  type: 'string',
                  title: 'Recration Feature',
                  'x-enum-code': {
                    'x-enum-code-category-name': 'invasives',
                    'x-enum-code-header-name': 'reserve_constraints_recreation_code',
                    'x-enum-code-name': 'code_name',
                    'x-enum-code-text': 'code_description',
                    'x-enum-code-sort-order': 'code_sort_order'
                  }
                },
                reserve_constraints_other: {
                  type: 'string',
                  title: 'Other'
                },
                reserve_constraints_comments: {
                  type: 'string',
                  title: 'Comments'
                }
              },
              required: [
                'recreation_feature',
                'cultural_heritage_feature',
                'visuals',
                'ogma',
                'uwr_wha_whf',
                'sensitive_terrain',
                'low_mercantile_timber',
                'noncommercial_brush',
                'rock_outcrop',
                'rrz',
                'rmz',
                'wetsite'
              ]
            },
            {
              properties: {
                reserve_constraints_none: {
                  enum: ['No']
                }
              }
            }
          ]
        }
      }
    },
    ecological_anchors: {
      type: 'object',
      title: 'Ecological Anchors',
      required: ['ecological_anchors_none'],
      properties: {
        ecological_anchors_none: {
          type: 'string',
          title: 'Are there any ecological anchors for this stratum?',
          default: 'No',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'ecological_anchors_none_code',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          }
        }
      },
      dependencies: {
        ecological_anchors_none: {
          oneOf: [
            {
              properties: {
                ecological_anchors_none: {
                  enum: ['Yes']
                },
                bear_den: {
                  type: 'number',
                  title: 'Bear Den'
                },
                hibernaculum: {
                  type: 'number',
                  title: 'Hibernaculum'
                },
                vet_trees: {
                  type: 'string',
                  title: 'Vet Trees/Ha',
                  'x-enum-code': {
                    'x-enum-code-category-name': 'invasives',
                    'x-enum-code-header-name': 'ecological_anchors_vet_trees_code',
                    'x-enum-code-name': 'code_name',
                    'x-enum-code-text': 'code_description',
                    'x-enum-code-sort-order': 'code_sort_order'
                  }
                },
                mineral_lick: {
                  type: 'number',
                  title: 'Mineral Lick'
                },
                large_stick_nest: {
                  type: 'number',
                  title: 'Large Stick Nest'
                },
                cavity_nest: {
                  type: 'number',
                  title: 'Cavity Nest'
                },
                large_hollow_tree: {
                  type: 'number',
                  title: 'Large Hollow Tree'
                },
                large_witches_broom: {
                  type: 'number',
                  title: 'Large Witches Broom'
                },
                karst_feature: {
                  type: 'string',
                  title: 'Karst Feature',
                  'x-enum-code': {
                    'x-enum-code-category-name': 'invasives',
                    'x-enum-code-header-name': 'ecological_anchors_karst_features_code',
                    'x-enum-code-name': 'code_name',
                    'x-enum-code-text': 'code_description',
                    'x-enum-code-sort-order': 'code_sort_order'
                  }
                },
                large_tree_for_site: {
                  type: 'string',
                  title: 'Large Tree for Site (Not Vets)',
                  'x-enum-code': {
                    'x-enum-code-category-name': 'invasives',
                    'x-enum-code-header-name': 'ecological_anchors_largest_trees_code',
                    'x-enum-code-name': 'code_name',
                    'x-enum-code-text': 'code_description',
                    'x-enum-code-sort-order': 'code_sort_order'
                  }
                },
                cwd_heavy_concentration: {
                  type: 'string',
                  title: 'CWD Heavy Natural Concentration',
                  'x-enum-code': {
                    'x-enum-code-category-name': 'invasives',
                    'x-enum-code-header-name': 'ecological_anchors_CWD_code',
                    'x-enum-code-name': 'code_name',
                    'x-enum-code-text': 'code_description',
                    'x-enum-code-sort-order': 'code_sort_order'
                  }
                },
                active_wildlife_trails: {
                  type: 'string',
                  title: 'Active Wildlife trails',
                  'x-enum-code': {
                    'x-enum-code-category-name': 'invasives',
                    'x-enum-code-header-name': 'ecological_anchors_active_trails_code',
                    'x-enum-code-name': 'code_name',
                    'x-enum-code-text': 'code_description',
                    'x-enum-code-sort-order': 'code_sort_order'
                  }
                },
                active_wlt_cwd_feeding: {
                  type: 'string',
                  title: 'Actilve WLT/CWD feeding',
                  'x-enum-code': {
                    'x-enum-code-category-name': 'invasives',
                    'x-enum-code-header-name': 'ecological_anchors_active_feeding_code',
                    'x-enum-code-name': 'code_name',
                    'x-enum-code-text': 'code_description',
                    'x-enum-code-sort-order': 'code_sort_order'
                  }
                },
                uncommon_tree_species: {
                  type: 'string',
                  title: 'Uncommon Tree Species',
                  'x-enum-code': {
                    'x-enum-code-category-name': 'invasives',
                    'x-enum-code-header-name': 'ecological_anchors_uncommon_trees_code',
                    'x-enum-code-name': 'code_name',
                    'x-enum-code-text': 'code_description',
                    'x-enum-code-sort-order': 'code_sort_order'
                  }
                },
                ecological_anchors_other: {
                  type: 'string',
                  title: 'Other'
                },
                ecological_anchors_comments: {
                  type: 'string',
                  title: 'Comments'
                }
              },
              required: [
                'bear_den',
                'hibernaculum',
                'vet_trees',
                'mineral_lick',
                'large_stick_nest',
                'cavity_nest',
                'large_hollow_tree',
                'active_wlt_cwd_feeding',
                'large_witches_broom',
                'karst_feature',
                'large_tree_for_site',
                'cwd_heavy_concentration',
                'active_wildlife_trails',
                'uncommon_tree_species'
              ]
            },
            {
              properties: {
                ecological_anchors_none: {
                  enum: ['No']
                }
              }
            }
          ]
        }
      }
    },
    form_a: {
      type: 'array',
      title: 'Form A',
      items: {
        ...FREP_FormA
      }
    }
  }
};
export const FREP_FormC = {
  title: 'Form C',
  type: 'object',
  properties: {
    opening_identification: {
      type: 'object',
      title: 'Opening Identification',
      properties: {
        opening_number: {
          type: 'string',
          title: 'Opening #'
        },
        opening_id: {
          type: 'string',
          title: 'Opening ID'
        },
        license_number: {
          type: 'string',
          title: 'License #'
        },
        cp_number: {
          type: 'string',
          title: 'CP#'
        },
        block: {
          type: 'string',
          title: 'Block'
        },
        licensee: {
          type: 'string',
          title: 'Licensee'
        },
        district_code: {
          type: 'string',
          title: 'District',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'district_code',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          }
        },
        location_description: {
          type: 'string',
          title: 'Location description'
        },
        nar: {
          type: 'number',
          title: 'NAR (ha)'
        },
        gross_area: {
          type: 'number',
          title: 'Gross area (ha)'
        },
        override_code: {
          type: 'string',
          title: 'Override',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'override_code',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          }
        }
      },
      required: [
        'opening_number',
        'opening_id',
        'license_number',
        'cp_number',
        'block',
        'licensee',
        'district_code',
        'nar',
        'gross_area',
        'override_code'
      ]
    },
    innovative_practices: {
      type: 'object',
      title: 'Project Data',
      properties: {
        innovative_practices: {
          type: 'string',
          title: 'Were any innovative and/or unique forest practices used on the block?'
        }
      },
      required: ['innovative_practices']
    },
    invasive_plants: {
      type: 'object',
      title: 'Invasive Plants',
      properties: {
        invasive_code: {
          type: 'string',
          title: 'Were any invasive plant species present on this block?',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'invasive_code',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          }
        }
      },
      required: ['invasive_code']
    },
    evaluator_opinion: {
      type: 'object',
      title: 'Evaluator Opinion/Comments',
      properties: {
        evaluator_opinion_code: {
          type: 'string',
          title:
            'To what extent did the practices on this cutblock maintain stand-level biodiversity given the opportunities that were available?',
          'x-enum-code': {
            'x-enum-code-category-name': 'invasives',
            'x-enum-code-header-name': 'evaluator_opinion_code',
            'x-enum-code-name': 'code_name',
            'x-enum-code-text': 'code_description',
            'x-enum-code-sort-order': 'code_sort_order'
          }
        },
        rationale: {
          type: 'string',
          title: 'Rationale'
        }
      },
      required: ['evaluator_opinion_code']
    },
    form_b: {
      type: 'array',
      title: 'Form B',
      items: {
        ...FREP_FormB
      }
    }
  }
};
